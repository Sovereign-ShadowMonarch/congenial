class Premium:
    def __init__(self, *args, **kwargs):
        pass

    def is_active(self):
        return True

def premium_api_remote_call(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

class PremiumCredentials:
    def __init__(self, *args, **kwargs):
        pass

def premium_create_and_verify(self, *args, **kwargs):
    return True 