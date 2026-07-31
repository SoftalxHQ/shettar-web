"use client"

import { useEffect, useMemo, useRef } from "react"
import { getCountries, getLgas, getStates, getTowns } from "@softalxhq/location-selector"
import { Col, Form } from "react-bootstrap"

const COUNTRIES = getCountries()
const SUPPORTED_CODES = new Set(COUNTRIES.map((c) => c.code.toUpperCase()))

export type LocationValue = {
  country: string
  state: string
  lga: string
  city: string
}

type LocationFieldsProps = {
  value: LocationValue
  onChange: (next: LocationValue) => void
  /** When true, attempt IP-based country default once on mount if country is empty. */
  detectCountry?: boolean
  required?: boolean
}

async function detectCountryCode(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = (await res.json()) as { country_code?: string }
    const code = data.country_code?.toUpperCase()
    if (code && SUPPORTED_CODES.has(code)) return code
    return null
  } catch {
    return null
  }
}

export function LocationFields({
  value,
  onChange,
  detectCountry = false,
  required = false,
}: LocationFieldsProps) {
  const userChangedCountry = useRef(false)
  const geoAttempted = useRef(false)
  const valueRef = useRef(value)
  valueRef.current = value

  const states = useMemo(
    () => (value.country ? getStates(value.country) : []),
    [value.country],
  )
  const lgas = useMemo(
    () => (value.country && value.state ? getLgas(value.country, value.state) : []),
    [value.country, value.state],
  )
  const towns = useMemo(
    () =>
      value.country && value.state && value.lga
        ? getTowns(value.country, value.state, value.lga)
        : [],
    [value.country, value.state, value.lga],
  )

  useEffect(() => {
    if (!detectCountry || geoAttempted.current || value.country) return
    geoAttempted.current = true

    let cancelled = false
    void detectCountryCode().then((code) => {
      if (cancelled || !code || userChangedCountry.current) return
      const current = valueRef.current
      // Profile may have hydrated while ipapi was in flight — never wipe saved location.
      if (current.country || current.state || current.lga || current.city) return
      onChange({ country: code, state: "", lga: "", city: "" })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for IP default
  }, [detectCountry])

  const setCountry = (country: string) => {
    userChangedCountry.current = true
    onChange({ country, state: "", lga: "", city: "" })
  }

  const setState = (state: string) => {
    onChange({ ...value, state, lga: "", city: "" })
  }

  const setLga = (lga: string) => {
    onChange({ ...value, lga, city: "" })
  }

  const setCity = (city: string) => {
    onChange({ ...value, city })
  }

  return (
    <>
      <Col md={6}>
        <Form.Label>
          Country {required && <span className="text-danger">*</span>}
        </Form.Label>
        <Form.Select
          value={value.country}
          onChange={(e) => setCountry(e.target.value)}
          required={required}
        >
          <option value="">Select country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col md={6}>
        <Form.Label>
          State {required && <span className="text-danger">*</span>}
        </Form.Label>
        <Form.Select
          value={value.state}
          onChange={(e) => setState(e.target.value)}
          disabled={!value.country}
          required={required}
        >
          <option value="">
            {value.country ? "Select state" : "Select country first"}
          </option>
          {states.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col md={6}>
        <Form.Label>
          LGA / District {required && <span className="text-danger">*</span>}
        </Form.Label>
        <Form.Select
          value={value.lga}
          onChange={(e) => setLga(e.target.value)}
          disabled={!value.state}
          required={required}
        >
          <option value="">
            {value.state ? "Select LGA / district" : "Select state first"}
          </option>
          {lgas.map((lga) => (
            <option key={lga.name} value={lga.name}>
              {lga.name}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col md={6}>
        <Form.Label>
          City / Town {required && <span className="text-danger">*</span>}
        </Form.Label>
        <Form.Select
          value={value.city}
          onChange={(e) => setCity(e.target.value)}
          disabled={!value.lga}
          required={required}
        >
          <option value="">
            {value.lga ? "Select city / town" : "Select LGA first"}
          </option>
          {towns.map((town) => (
            <option key={town} value={town}>
              {town}
            </option>
          ))}
        </Form.Select>
      </Col>
    </>
  )
}
