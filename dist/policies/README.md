# Policy Documents

This folder contains official university policy documents that can be downloaded from the HRMS system.

## Current Documents

1. **HARASSMENT-POLICY.pdf** - Harassment prevention and reporting guidelines
2. **COVID-19-Pandemic-Attendance-Policy.pdf** - COVID-19 attendance protocols
3. **Faculty-Promotion-Proforma.pdf** - Faculty promotion application form

## Instructions

To add the policy documents to your HRMS system:

1. Copy the PDF files you provided to this `public/policies/` folder
2. Rename them to match the names below (or update the names in the PolicyAdvisory.jsx component):
   - `HARASSMENT-POLICY.pdf`
   - `COVID-19-Pandemic-Attendance-Policy.pdf`
   - `Faculty-Promotion-Proforma.pdf`

The files will then be accessible at:

- http://localhost:5173/policies/HARASSMENT-POLICY.pdf
- http://localhost:5173/policies/COVID-19-Pandemic-Attendance-Policy.pdf
- http://localhost:5173/policies/Faculty-Promotion-Proforma.pdf

## Adding New Policies

To add new policy documents:

1. Add the PDF file to this folder
2. Update the `policyDocuments` array in `src/portals/hr/pages/PolicyAdvisory.jsx`
3. Add the document details including title, description, category, etc.
