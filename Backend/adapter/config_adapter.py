#!/usr/bin/env python
'''
Configuration adapter module for Rotkehlchen backend
This module helps integrate the external configuration files with the backend
'''
import os
import json
import logging

logger = logging.getLogger(__name__)

class ConfigAdapter:
    '''Adapter to load external configuration into the Rotkehlchen backend'''
    
    def __init__(self, project_dir):
        '''Initialize the adapter with the project directory'''
        self.project_dir = project_dir
        self.config_dir = os.path.join(project_dir, 'config')
        self.node_config_file = os.path.join(self.config_dir, 'node_config.json')
        self.exchange_config_file = os.path.join(self.config_dir, 'exchange_config.json')
        
        self._load_configs()
    
    def _load_configs(self):
        '''Load configuration files'''
        try:
            if os.path.exists(self.node_config_file):
                with open(self.node_config_file, 'r') as f:
                    self.node_config = json.load(f)
            else:
                self.node_config = {}
                
            if os.path.exists(self.exchange_config_file):
                with open(self.exchange_config_file, 'r') as f:
                    self.exchange_config = json.load(f)
            else:
                self.exchange_config = {}
                
            logger.info("Loaded external configuration files successfully")
        except Exception as e:
            logger.error(f"Error loading configuration files: {e}")
            self.node_config = {}
            self.exchange_config = {}
    
    def get_eth_rpc_endpoint(self):
        '''Get the Ethereum RPC endpoint'''
        return self.node_config.get('eth_rpc_endpoint', '')
    
    def get_btc_rpc_endpoint(self):
        '''Get the Bitcoin RPC endpoint'''
        return self.node_config.get('btc_rpc_endpoint', '')
    
    def get_exchange_credentials(self, exchange_name):
        '''Get API credentials for a specific exchange'''
        if exchange_name in self.exchange_config:
            return (
                self.exchange_config[exchange_name].get('api_key', ''),
                self.exchange_config[exchange_name].get('api_secret', '')
            )
        return ('', '')
    
    def save_exchange_credentials(self, exchange_name, api_key, api_secret):
        '''Save API credentials for a specific exchange'''
        if exchange_name not in self.exchange_config:
            self.exchange_config[exchange_name] = {}
            
        self.exchange_config[exchange_name]['api_key'] = api_key
        self.exchange_config[exchange_name]['api_secret'] = api_secret
        
        try:
            with open(self.exchange_config_file, 'w') as f:
                json.dump(self.exchange_config, f, indent=4)
            logger.info(f"Saved credentials for {exchange_name}")
            return True
        except Exception as e:
            logger.error(f"Error saving exchange credentials: {e}")
            return False
