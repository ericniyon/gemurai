#!/bin/bash

# Configuration Helper for Stock Rejection Testing
# This script helps you get the required configuration values

BASE_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Getting Test Configuration for Stock Rejection Testing${NC}\n"

# Step 1: Get products to find a test product
echo -e "${BLUE}📦 Step 1: Getting available products...${NC}"
PRODUCTS_RESPONSE=$(curl -s "$BASE_URL/api/v1/products")

# Check if we got a valid response
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to connect to API. Make sure your server is running on $BASE_URL${NC}"
    exit 1
fi

# Try to parse the response
PRODUCTS_COUNT=$(echo $PRODUCTS_RESPONSE | jq -r '.data | length // 0' 2>/dev/null)

if [ "$PRODUCTS_COUNT" = "0" ] || [ "$PRODUCTS_COUNT" = "null" ]; then
    echo -e "${RED}❌ No products found or invalid response${NC}"
    echo "Response: $PRODUCTS_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Found $PRODUCTS_COUNT products${NC}"

# Find a product with stock
PRODUCT_WITH_STOCK=$(echo $PRODUCTS_RESPONSE | jq -r '.data[] | select(.stock > 0) | {id: .id, name: .name, stock: .stock, sellerId: .sellerId} | @json' | head -1)

if [ -z "$PRODUCT_WITH_STOCK" ]; then
    echo -e "${RED}❌ No products with stock found. Please add stock to some products.${NC}"
    exit 1
fi

PRODUCT_ID=$(echo $PRODUCT_WITH_STOCK | jq -r '.id')
PRODUCT_NAME=$(echo $PRODUCT_WITH_STOCK | jq -r '.name')
PRODUCT_STOCK=$(echo $PRODUCT_WITH_STOCK | jq -r '.stock')
PRODUCT_SELLER_ID=$(echo $PRODUCT_WITH_STOCK | jq -r '.sellerId')

echo -e "${GREEN}✅ Found product with stock: \"$PRODUCT_NAME\" (ID: $PRODUCT_ID, Stock: $PRODUCT_STOCK)${NC}"

# Step 2: Try to get users (this might fail if not authenticated)
echo -e "${BLUE}👥 Step 2: Getting available users...${NC}"
USERS_RESPONSE=$(curl -s "$BASE_URL/api/v1/users")

# Check if we got a valid response
USERS_COUNT=$(echo $USERS_RESPONSE | jq -r '.data | length // 0' 2>/dev/null)

if [ "$USERS_COUNT" = "0" ] || [ "$USERS_COUNT" = "null" ]; then
    echo -e "${YELLOW}⚠️  Could not get users via API. You may need to check your database directly.${NC}"
    echo -e "${YELLOW}📋 Manual Configuration Required:${NC}"
    echo "Please update the TEST_CONFIG in test-stock-rejection-curl.sh with:"
    echo "PRODUCT_ID=\"$PRODUCT_ID\""
    echo "EMPLOYER_ID=\"$PRODUCT_SELLER_ID\"  # This is the seller of the product"
    echo "EMPLOYER_TOKEN=\"your_employer_auth_token\""
    echo "DCC_TOKEN=\"your_dcc_auth_token\""
    echo ""
    echo -e "${YELLOW}🔑 To get authentication tokens:${NC}"
    echo "1. Login as employer and check browser dev tools for the token"
    echo "2. Login as DCC and check browser dev tools for the token"
    echo "3. Or use the login API endpoints to get tokens programmatically"
    exit 0
fi

echo -e "${GREEN}✅ Found $USERS_COUNT users${NC}"

# Find employer and DCC users
EMPLOYER=$(echo $USERS_RESPONSE | jq -r '.data[] | select(.userRole.role.name == "EMPLOYER") | {id: .id, name: .name, email: .email} | @json' | head -1)
DCC=$(echo $USERS_RESPONSE | jq -r '.data[] | select(.userRole.role.name == "DCC") | {id: .id, name: .name, email: .email} | @json' | head -1)

if [ -z "$EMPLOYER" ]; then
    echo -e "${RED}❌ No EMPLOYER user found. Please create an employer user.${NC}"
    exit 1
fi

if [ -z "$DCC" ]; then
    echo -e "${RED}❌ No DCC user found. Please create a DCC user.${NC}"
    exit 1
fi

EMPLOYER_ID=$(echo $EMPLOYER | jq -r '.id')
EMPLOYER_NAME=$(echo $EMPLOYER | jq -r '.name')
DCC_ID=$(echo $DCC | jq -r '.id')
DCC_NAME=$(echo $DCC | jq -r '.name')

echo -e "${GREEN}✅ Found EMPLOYER: \"$EMPLOYER_NAME\" (ID: $EMPLOYER_ID)${NC}"
echo -e "${GREEN}✅ Found DCC: \"$DCC_NAME\" (ID: $DCC_ID)${NC}"

# Check if the product belongs to the employer
if [ "$PRODUCT_SELLER_ID" != "$EMPLOYER_ID" ]; then
    echo -e "${YELLOW}⚠️  Product \"$PRODUCT_NAME\" does not belong to employer \"$EMPLOYER_NAME\"${NC}"
    echo -e "${YELLOW}   Product seller ID: $PRODUCT_SELLER_ID${NC}"
    echo -e "${YELLOW}   Employer ID: $EMPLOYER_ID${NC}"
    echo -e "${YELLOW}   You may need to find a product that belongs to this employer.${NC}"
else
    echo -e "${GREEN}✅ Product \"$PRODUCT_NAME\" belongs to employer \"$EMPLOYER_NAME\"${NC}"
fi

# Generate configuration
echo -e "${BLUE}📋 Generated Test Configuration:${NC}"
echo "Copy this into your test-stock-rejection-curl.sh file:"
echo ""
echo "# Configuration - Update these values"
echo "EMPLOYER_TOKEN=\"your_employer_token_here\"  # Get from login"
echo "DCC_TOKEN=\"your_dcc_token_here\"  # Get from login"
echo "PRODUCT_ID=\"$PRODUCT_ID\""
echo "EMPLOYER_ID=\"$EMPLOYER_ID\""
echo ""
echo -e "${YELLOW}🔑 To get authentication tokens:${NC}"
echo "1. Login as employer and check browser dev tools for the token"
echo "2. Login as DCC and check browser dev tools for the token"
echo "3. Or use the login API endpoints to get tokens programmatically"
echo ""
echo -e "${GREEN}🚀 Once you have the tokens, run: ./test-stock-rejection-curl.sh${NC}"
