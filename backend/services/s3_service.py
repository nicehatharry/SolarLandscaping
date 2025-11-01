"""
Service for interacting with AWS S3 storage
"""
import json
import logging
from typing import Dict, List, Any
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class S3Service:
    """Service for reading from and writing to AWS S3"""

    def __init__(
        self,
        bucket_name: str,
        aws_access_key_id: str = None,
        aws_secret_access_key: str = None,
        region_name: str = "us-east-1"
    ):
        """
        Initialize S3 service
        
        Args:
            bucket_name: Name of the S3 bucket
            aws_access_key_id: AWS access key (optional, uses IAM role if not provided)
            aws_secret_access_key: AWS secret key (optional)
            region_name: AWS region name
        """
        self.bucket_name = bucket_name
        
        # Initialize S3 client
        if aws_access_key_id and aws_secret_access_key:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key,
                region_name=region_name
            )
        else:
            # Use default credentials (IAM role, environment variables, etc.)
            self.s3_client = boto3.client('s3', region_name=region_name)

    async def read_json_file(self, file_key: str) -> Dict[str, Any]:
        """
        Read a JSON file from S3
        
        Args:
            file_key: S3 object key (file path in bucket)
            
        Returns:
            Parsed JSON data as dictionary
            
        Raises:
            Exception: If file cannot be read or parsed
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            
            content = response['Body'].read().decode('utf-8')
            data = json.loads(content)
            
            logger.info(f"Successfully read {file_key} from S3")
            return data
            
        except ClientError as error:
            if error.response['Error']['Code'] == 'NoSuchKey':
                logger.warning(f"File not found in S3: {file_key}")
                # Return empty structure if file doesn't exist
                return {}
            else:
                logger.error(f"Error reading from S3: {error}")
                raise Exception(f"Failed to read file from S3: {str(error)}")
        except json.JSONDecodeError as error:
            logger.error(f"Error parsing JSON from S3: {error}")
            raise Exception(f"Invalid JSON in S3 file: {str(error)}")

    async def write_json_file(
        self,
        file_key: str,
        data: Dict[str, Any]
    ) -> None:
        """
        Write a JSON file to S3
        
        Args:
            file_key: S3 object key (file path in bucket)
            data: Data to write as JSON
            
        Raises:
            Exception: If file cannot be written
        """
        try:
            json_content = json.dumps(data, indent=2, ensure_ascii=False)
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=json_content.encode('utf-8'),
                ContentType='application/json'
            )
            
            logger.info(f"Successfully wrote {file_key} to S3")
            
        except ClientError as error:
            logger.error(f"Error writing to S3: {error}")
            raise Exception(f"Failed to write file to S3: {str(error)}")

    async def append_to_json_array(
        self,
        file_key: str,
        new_item: Dict[str, Any]
    ) -> None:
        """
        Append an item to a JSON array file in S3
        If the file doesn't exist, creates it with the new item
        
        Args:
            file_key: S3 object key (file path in bucket)
            new_item: Item to append to the array
            
        Raises:
            Exception: If operation fails
        """
        try:
            # Read existing data
            existing_data = await self.read_json_file(file_key)
            
            # If file is empty or doesn't exist, initialize as array
            if not existing_data:
                existing_data = []
            
            # Ensure we have a list
            if not isinstance(existing_data, list):
                logger.warning(
                    f"File {file_key} is not an array, converting to array"
                )
                existing_data = [existing_data]
            
            # Append new item
            existing_data.append(new_item)
            
            # Write back to S3
            await self.write_json_file(file_key, existing_data)
            
            logger.info(f"Successfully appended item to {file_key}")
            
        except Exception as error:
            logger.error(f"Error appending to JSON array: {error}")
            raise Exception(f"Failed to append to JSON file: {str(error)}")