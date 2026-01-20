#!/usr/bin/env python3
"""
Script to classify companies by industry using OpenAI API.
Reads Corporate accounts 2026.xlsx and adds an Industry column.
"""

import pandas as pd
import openai
import sys
import os
from pathlib import Path

# Industry options from the image
VALID_INDUSTRIES = [
    "FSI",
    "Retail",
    "Manufacturing",
    "Utilities",
    "Transportation",
    "Conglomerate",
    "Government",
    "Telco",
    "Healthcare",
    "Aviation",
    "Defence"
]

def get_api_key():
    """Read OpenAI API key from secrets.md file in the parent directory."""
    secrets_path = Path(__file__).parent.parent / "secrets.md"
    try:
        with open(secrets_path, 'r') as f:
            content = f.read()
            # Extract API key (format: OpenAI API Key= <key>)
            for line in content.split('\n'):
                if 'OpenAI API Key=' in line:
                    api_key = line.split('=', 1)[1].strip()
                    return api_key
        raise ValueError("API key not found in secrets.md")
    except FileNotFoundError:
        raise FileNotFoundError(f"secrets.md file not found at {secrets_path}")
    except Exception as e:
        raise Exception(f"Error reading secrets.md: {str(e)}")

def classify_company_industry(client, company_name):
    """
    Use OpenAI API to classify a company's industry.
    Returns one of the valid industries.
    """
    prompt = f"""Classify the following company into exactly one of these industries:
{', '.join(VALID_INDUSTRIES)}

Company name: {company_name}

Respond with ONLY the industry name from the list above, nothing else. If uncertain, choose the most likely industry based on the company name."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using efficient model
            messages=[
                {"role": "system", "content": "You are a helpful assistant that classifies companies by industry. Always respond with only the industry name from the provided list."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=20
        )
        
        industry = response.choices[0].message.content.strip()
        
        # Validate that the response is in our list
        if industry not in VALID_INDUSTRIES:
            # Try to find a close match (case-insensitive)
            industry_lower = industry.lower()
            for valid in VALID_INDUSTRIES:
                if valid.lower() == industry_lower:
                    return valid
            # If no match, default to the first valid industry and log warning
            print(f"  Warning: '{industry}' not in valid list, defaulting to 'FSI'")
            return "FSI"
        
        return industry
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")

def main():
    """Main function to process the Excel file."""
    script_dir = Path(__file__).parent
    input_file = script_dir / "Corporate accounts 2026.xlsx"
    output_file = script_dir / "Corporate accounts 2026 updated.xlsx"
    
    # Validate input file exists
    if not input_file.exists():
        print(f"ERROR: Input file not found: {input_file}")
        print("Please ensure 'Corporate accounts 2026.xlsx' exists in the same directory.")
        sys.exit(1)
    
    # Get API key
    try:
        api_key = get_api_key()
        print("✓ API key retrieved successfully")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        print("Please check that secrets.md in the parent directory contains a valid OpenAI API key.")
        sys.exit(1)
    
    # Initialize OpenAI client
    try:
        client = openai.OpenAI(api_key=api_key)
        print("✓ OpenAI client initialized")
    except Exception as e:
        print(f"ERROR: Failed to initialize OpenAI client: {str(e)}")
        sys.exit(1)
    
    # Read Excel file
    try:
        print(f"\nReading Excel file: {input_file}")
        df = pd.read_excel(input_file)
        print(f"✓ Loaded {len(df)} rows")
        
        # Check if 'Sales Group Name' column exists
        if 'Sales Group Name' not in df.columns:
            print(f"ERROR: 'Sales Group Name' column not found in Excel file.")
            print(f"Available columns: {', '.join(df.columns)}")
            sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed to read Excel file: {str(e)}")
        print("Please ensure the file is a valid Excel file and not corrupted.")
        sys.exit(1)
    
    # Check if Industry column already exists
    if 'Industry' in df.columns:
        print("WARNING: 'Industry' column already exists. It will be overwritten.")
    
    # Process each company
    print(f"\nProcessing {len(df)} companies...")
    print("-" * 60)
    
    industries = []
    for idx, row in df.iterrows():
        company_name = str(row['Sales Group Name']).strip()
        
        if pd.isna(row['Sales Group Name']) or company_name == '':
            print(f"Row {idx + 1}/{len(df)}: Skipping empty company name")
            industries.append("Unknown")
            continue
        
        print(f"Row {idx + 1}/{len(df)}: Processing '{company_name}'...", end=' ', flush=True)
        
        try:
            industry = classify_company_industry(client, company_name)
            industries.append(industry)
            print(f"→ {industry}")
        except Exception as e:
            error_msg = str(e)
            print(f"\nERROR at row {idx + 1}: {error_msg}")
            print(f"Company: {company_name}")
            if "401" in error_msg or "invalid_api_key" in error_msg or "Incorrect API key" in error_msg:
                print("\n⚠️  API Key Error: The OpenAI API key in secrets.md (parent directory) is invalid or expired.")
                print("   Please update secrets.md with a valid API key from:")
                print("   https://platform.openai.com/account/api-keys")
            print("\nStopping processing due to critical error.")
            sys.exit(1)
    
    # Add Industry column
    df['Industry'] = industries
    
    # Save to new file
    try:
        print(f"\nSaving results to: {output_file}")
        df.to_excel(output_file, index=False)
        print(f"✓ Successfully saved {len(df)} rows with industry classifications")
        print(f"\nSummary:")
        print(df['Industry'].value_counts().to_string())
    except Exception as e:
        print(f"ERROR: Failed to save Excel file: {str(e)}")
        print("Please check file permissions and disk space.")
        sys.exit(1)
    
    print("\n✓ Processing complete!")

if __name__ == "__main__":
    main()
