#!/usr/bin/env bash

WORKDIR=$PWD
# cleanup before starting to package stuff
make clean

if [[ -n "${CI-}" ]]; then
  echo "::group::Pip install"
fi

# Perform sanity checks before pip install
pip install packaging  # required for the following script
# We use npm ci. That needs npm >= 5.7.0
npm --version | python -c "import sys;npm_version=sys.stdin.readlines()[0].rstrip('\n');from packaging import version;supported=version.parse(npm_version) >= version.parse('5.7.0');sys.exit(1) if not supported else sys.exit(0);"
if [[ $? -ne 0 ]]; then
    echo "package.sh - ERROR: The system's npm version is not >= 5.7.0 which is required for npm ci"
    exit 1
fi

# Install the rotki package and pyinstaller. Needed by the pyinstaller
pip install -e .
pip install pyinstaller==3.5

if [[ -n "${CI-}" ]]; then
  echo "::endgroup::"
fi

# Perform sanity checks that need pip install
python -c "import sys;from rotkehlchen.db.dbhandler import detect_sqlcipher_version; version = detect_sqlcipher_version();sys.exit(0) if version == 4 else sys.exit(1)"
if [[ $? -ne 0 ]]; then
    echo "package.sh - ERROR: The packaging system's sqlcipher version is not >= v4"
    exit 1
fi


# Get the arch
ARCH=$(uname -m)
if [[ "$ARCH" == 'x86_64' ]]; then
    ARCH='x64'
else
    echo "package.sh - ERROR: Unsupported architecture '${ARCH}'"
    exit 1
fi

# Get the platform
if [[ "$OSTYPE" == "linux-gnu" ]]; then
    PLATFORM='linux'
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM='darwin'
    export ONEFILE=0
elif [[ "$OSTYPE" == "win32" ]]; then
    PLATFORM='win32'
elif [[ "$OSTYPE" == "freebsd"* ]]; then
    PLATFORM='freebsd'
else
    echo "package.sh - ERROR: Unsupported platform '${OSTYPE}'"
    exit 1
fi

if [[ -n "${CI-}" ]]; then
  echo "::group::PyInstaller"
fi
# Use pyinstaller to package the python app
rm -rf build rotkehlchen_py_dist
pyinstaller --noconfirm --clean --distpath rotkehlchen_py_dist rotkehlchen.spec

if [[ -n "${CI-}" ]]; then
  echo "::endgroup::"
fi

ROTKEHLCHEN_VERSION=$(python setup.py --version)
export ROTKEHLCHEN_VERSION

if [[ $? -ne 0 ]]; then
    echo "package.sh - ERROR: pyinstaller step failed"
    exit 1
fi



echo 'Checking binary'
if [[ "$PLATFORM" == "darwin" ]]; then
  PYINSTALLER_GENERATED_EXECUTABLE=$(find ./rotkehlchen_py_dist/rotkehlchen -name "rotkehlchen-*-macos")
  ./rotkehlchen_py_dist/rotkehlchen/${PYINSTALLER_GENERATED_EXECUTABLE##*/} version
else
  # Sanity check that the generated python executable works
  PYINSTALLER_GENERATED_EXECUTABLE=$(ls rotkehlchen_py_dist | head -n 1)
  ./rotkehlchen_py_dist/$PYINSTALLER_GENERATED_EXECUTABLE version
fi


if [[ $? -ne 0 ]]; then
    echo "package.sh - ERROR: The generated python executable does not work properly"
    exit 1
fi

if [[ -n "${CI-}" ]] && [[ "$PLATFORM" == "darwin" ]] && [[ -n "${CERTIFICATE_OSX_APPLICATION-}" ]]; then
  echo "Preparing to sign backend binary for macos"
  KEY_CHAIN=rotki-build.keychain
  CSC_LINK=/tmp/certificate.p12
  export CSC_LINK
  # Recreate the certificate from the secure environment variable
  echo $CERTIFICATE_OSX_APPLICATION | base64 --decode > $CSC_LINK
  #create a keychain
  security create-keychain -p actions $KEY_CHAIN
  # Make the keychain the default so identities are found
  security default-keychain -s $KEY_CHAIN
  # Unlock the keychains
  security unlock-keychain -p actions $KEY_CHAIN
  security import $CSC_LINK -k $KEY_CHAIN -P $CSC_KEY_PASSWORD -T /usr/bin/codesign;
  security set-key-partition-list -S apple-tool:,apple: -s -k actions $KEY_CHAIN

  echo "::group::Preparing to sign"
  files=(`find ./rotkehlchen_py_dist -type f -exec ls -dl \{\} \; | awk '{ print $9 }'`)
  for i in "${files[@]}"
  do
    echo "Signing $i"
    codesign --force --options runtime --entitlements ./packaging/entitlements.plist --sign $IDENTITY $i --timestamp || exit 1
    codesign --verify --verbose $i || exit 1
  done
  echo "::endgroup::"
fi


if [[ -n "${CI-}" ]] && [[ "$OSTYPE" == "darwin"* ]]; then
  # remove certs
  rm -fr /tmp/*.p12
fi

echo "Packaging finished for Rotki ${ROTKEHLCHEN_VERSION}"

# Go back to root directory
cd "$WORKDIR" || exit 1
