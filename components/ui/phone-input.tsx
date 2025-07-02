"use client"

import Image from "next/image"
import React, { forwardRef, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CountryCode = {
  code: string
  country: string
  flag: string
}

// East African country codes
const countryCodes: CountryCode[] = [
  {
    country: "Tanzania",
    code: "+255",
    flag: "🇹🇿",
  },
  {
    country: "Kenya",
    code: "+254",
    flag: "🇰🇪",
  },
  {
    country: "Uganda",
    code: "+256",
    flag: "🇺🇬",
  },
  {
    country: "Rwanda",
    code: "+250",
    flag: "🇷🇼",
  },
  {
    country: "Burundi",
    code: "+257",
    flag: "🇧🇮",
  },
]

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  countryCode?: string
  onChange?: (value: string) => void
  value?: string
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ countryCode: initialCountryCode = "+255", onChange, value, onBlur, ...props }, ref) => {
    // Parse the initial value if it's a complete phone number with country code
    const parseInitialValue = () => {
      // Handle null, undefined, and non-string values
      const phoneValue = value == null ? '' : (typeof value === 'string' ? value : String(value));
      if (!phoneValue) return { countryCode: initialCountryCode, phoneNumber: "" }
      
      // Check if the value starts with a + (has country code)
      if (phoneValue.startsWith("+")) {
        // Find the country code that matches the beginning of the value
        const matchedCountry = countryCodes.find(country => 
          phoneValue.startsWith(country.code)
        )
        
        if (matchedCountry) {
          return {
            countryCode: matchedCountry.code,
            phoneNumber: phoneValue.substring(matchedCountry.code.length)
          }
        }
      }
      
      // Default case: use initial country code and the entire value as phone number
      return { countryCode: initialCountryCode, phoneNumber: phoneValue }
    }
    
    const parsedValue = parseInitialValue()
    const [countryCode, setCountryCode] = useState<string>(parsedValue.countryCode)
    const [phoneNumber, setPhoneNumber] = useState<string>(parsedValue.phoneNumber)

    // Function to format and provide the complete phone number
    const formatPhoneNumber = (code: string, number: string) => {
      return `${code}${number}`;
    }

    const handleCountryCodeChange = (code: string) => {
      setCountryCode(code)
      onChange?.(formatPhoneNumber(code, phoneNumber))
    }

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPhoneNumber = e.target.value
      setPhoneNumber(newPhoneNumber)
      onChange?.(formatPhoneNumber(countryCode, newPhoneNumber))
    }

    return (
      <div className="flex">
        <Select
          value={countryCode}
          onValueChange={handleCountryCodeChange}
        >
          <SelectTrigger className="w-[105px] rounded-r-none border-r-0">
            <SelectValue placeholder="Code" />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="rounded-l-none flex-1"
          placeholder="712XXXXXX"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          onBlur={onBlur}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)

PhoneInput.displayName = "PhoneInput"

export { PhoneInput }