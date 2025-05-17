#!/usr/bin/env bash

# Read the RPC URL
source .env
if [ -z "$RPC_URL" ]; then
    echo "RPC_URL is not set in .env file"
    exit 1
fi
if [ -z "$PRIVATE_KEY" ]; then
    echo "PRIVATE_KEY is not set in .env file"
    exit 1
fi
if [ -z "$DEPLOYER_CHAIN_NAME" ]; then
    echo "DEPLOYER_CHAIN_NAME is not set in .env file"
    exit 1
fi
if [ -z "$DEPLOYER_SCRIPT" ]; then
    echo "DEPLOYER_SCRIPT is not set in .env file"
    exit 1
fi
# Run the script
echo Running Script: $DEPLOYER_SCRIPT...

# Run the script with interactive inputs
forge script script/$DEPLOYER_SCRIPT \
    --via-ir \
    --chain $DEPLOYER_CHAIN_NAME \
    --rpc-url $RPC_URL \
    --broadcast \
    --verify \
    -vvvv \
    --private-key $PRIVATE_KEY
