import math
import os
import requests
from geoip2.database import Reader
from geoip2.errors import AddressNotFoundError
from typing import Optional, Dict
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class GeolocationService:
    def __init__(self):
        pass
    
    def _check_database(self):
        """Check if the GeoIP database file exists"""
        if not os.path.exists(self.db_path):
            logger.warning(f"GeoIP database not found at {self.db_path}")
            return False
        return True
    
    def _is_private_ip(self, ip: str) -> bool:
        """Check if IP address is private/local"""
        try:
            parts = ip.split('.')
            if len(parts) != 4:
                return False
            
            first_octet = int(parts[0])
            second_octet = int(parts[1])
            
            # Private IP ranges
            if first_octet == 10:  # 10.0.0.0/8
                return True
            elif first_octet == 172 and 16 <= second_octet <= 31:  # 172.16.0.0/12
                return True
            elif first_octet == 192 and second_octet == 168:  # 192.168.0.0/16
                return True
            elif ip == '127.0.0.1' or ip.startswith('127.'):  # Localhost
                return True
            
            return False
        except (ValueError, IndexError):
            return False
    
    def _lookup_ip_online(self, ip: str) -> Optional[Dict]:
        """
        Fallback method to lookup IP using Geoapify service
        """
        try:
            api_key = settings.GEOAPIFY_API_KEY
            logger.info(f"Using Geoapify API key: {api_key}")
            response = requests.get(f"https://api.geoapify.com/v1/ipinfo?ip={ip}&apiKey={api_key}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                
                # Extract location data from Geoapify response
                location = data.get('location', {})
                city = data.get('city', {}).get('name', '')
                state = data.get('state', {}).get('name', '')
                country = data.get('country', {}).get('name', '')
                
                info = {
                    'ip': ip,
                    'country': country,
                    'city': city,
                    'region': state,
                    'lat': location.get('latitude'),
                    'lon': location.get('longitude'),
                    'tz': None,  # Geoapify doesn't provide timezone in this endpoint
                    'radius_km': 50,  # Default accuracy radius
                }
                
                # Create address string
                address_parts = [part for part in [city, state, country] if part]
                info['address'] = ', '.join(address_parts)
                
                logger.info(f"Geoapify IP lookup successful for {ip}: {info}")
                return info
            else:
                logger.warning(f"Geoapify IP lookup HTTP error for {ip}: {response.status_code}")
        except requests.RequestException as e:
            logger.error(f"Geoapify IP lookup request failed for {ip}: {str(e)}")
        except Exception as e:
            logger.error(f"Geoapify IP lookup error for {ip}: {str(e)}")
        
        return None
    
    def lookup_ip(self, ip: str) -> Optional[Dict]:
        """
        Lookup IP address and return location information using online service
        """
        try:
            if self._is_private_ip(ip):
                logger.info(f"IP address {ip} is private/local, skipping geolocation")
                return None
            
            # Use online lookup
            logger.info(f"Attempting online IP lookup for {ip}")
            return self._lookup_ip_online(ip)
                
        except Exception as e:
            logger.error(f"Error looking up IP {ip}: {str(e)}")
            return None 