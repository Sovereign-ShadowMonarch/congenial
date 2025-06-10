#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pathlib

from pkg_resources import parse_requirements
from setuptools import find_packages, setup

# Repository root directory for use with reading files
directory = pathlib.Path(__file__).parent

requirements = directory.joinpath('requirements.txt').read_text()
requirements = [str(r) for r in parse_requirements(requirements)]

version = '1.14.2'  # Do not edit: this is maintained by bumpversion (see .bumpversion.cfg)

setup(
    name='rotkehlchen',
    author='Chakradharishiva',
    author_email='cs7@cs7.io',
    description='Acccounting, asset management and tax report helper for cryptocurrencies',
    license='AGPL',
    keywords='accounting tax-report portfolio asset-management cryptocurrencies',
    url='',
    packages=find_packages('.'),
    package_data={
        # TODO: Investigate if it's needed. rotkehlchen.spec is where files seem to be copied
        "rotkehlchen": ["data/*.json", "data/*.meta"],
    },
    python_requires='>=3.6',
    install_requires=requirements,
    version=version,
    long_description=directory.joinpath('README.md').read_text(),
    long_description_content_type='text/markdown',
    classifiers=[
        'Development Status :: 1 - Planning',
        'Topic :: Utilities',
    ],
    entry_points={
        'console_scripts': [
            'rotkehlchen = rotkehlchen.__main__:main',
        ],
    },
)
