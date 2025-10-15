export const team = [
  { name: 'Farah Pasha', role: 'Managing Partner', phone: '+91 98765 32101', email: 'farah@pashalawsenate.com' },
  { name: 'Karan Iyer', role: 'Senior Associate', phone: '+91 98220 88441', email: 'karan@pashalawsenate.com' },
  { name: 'Sana Hussain', role: 'Litigation Lead', phone: '+91 98110 22456', email: 'sana@pashalawsenate.com' },
]

export const caseSummaries = [
  {
    id: 'CIV/2381/2024',
    client: 'Blue Harbor Logistics',
    opponent: 'Port Trust Authority',
    practiceArea: 'Commercial Dispute',
    nextDate: '2024-06-21',
    courtroom: 'Bombay High Court, Courtroom 5',
    status: 'Evidence Submission',
    notes: 'Expert witness affidavit due two days before hearing.'
  },
  {
    id: 'CRL/0175/2024',
    client: 'Rahul Desai',
    opponent: 'State of Maharashtra',
    practiceArea: 'Criminal Defence',
    nextDate: '2024-07-03',
    courtroom: 'Sessions Court Mumbai, Court 12',
    status: 'Arguments Scheduled',
    notes: 'Coordinate with counsel for bail extension paperwork.'
  },
  {
    id: 'FAM/8842/2023',
    client: 'Priya Nair',
    opponent: 'Anil Nair',
    practiceArea: 'Family Law',
    nextDate: '2024-06-27',
    courtroom: 'Family Court Ernakulam',
    status: 'Mediation Review',
    notes: 'Prepare updated child custody plan and asset disclosures.'
  },
]

export const clients = [
  {
    name: 'Blue Harbor Logistics',
    contact: 'Rakesh Menon',
    phone: '+91 90044 88990',
    email: 'rakesh@blueharbor.in',
    notes: 'Retained for long-term commercial disputes and compliance.'
  },
  {
    name: 'Rahul Desai',
    contact: 'Self',
    phone: '+91 99112 77654',
    email: 'rahul.desai@gmail.com',
    notes: 'Criminal defence client with ongoing compliance requirements.'
  },
  {
    name: 'Priya Nair',
    contact: 'Self',
    phone: '+91 98980 12354',
    email: 'priya.nair@gmail.com',
    notes: 'Family law client requiring weekly updates.'
  },
  {
    name: 'Sunrise Developers',
    contact: 'Nitin Sharma',
    phone: '+91 99887 33001',
    email: 'nitin@sunriseinfra.com',
    notes: 'Retainer for real-estate contract vetting and due diligence.'
  }
]

export const tasks = [
  { title: 'File written submissions for CIV/2381/2024', owner: 'Karan Iyer', due: '2024-06-18' },
  { title: 'Client prep call for CRL/0175/2024', owner: 'Sana Hussain', due: '2024-06-19' },
  { title: 'Draft retainer renewal for Sunrise Developers', owner: 'Farah Pasha', due: '2024-06-20' },
]

export const resources = [
  {
    title: 'Court Filing Checklist',
    description: 'Step-by-step checklist for filings across the Bombay High Court and district courts.',
    link: '#'
  },
  {
    title: 'Client Onboarding Template',
    description: 'Pre-drafted questionnaire and engagement letter for new corporate clients.',
    link: '#'
  },
  {
    title: 'Litigation Calendar SOP',
    description: 'Standard operating procedure for maintaining cause lists and alerts.',
    link: '#'
  }
]

export const stats = {
  activeMatters: 48,
  hearingsThisWeek: 9,
  filingsPending: 6,
  teamUtilisation: 82
}
