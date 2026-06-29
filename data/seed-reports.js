/**
 * SafeStep — Seed Reports
 * These are hardcoded sample reports. They render on every page load on every
 * device with zero setup — the map is never empty for a cold open.
 *
 * Location: Thiruvananthapuram city center area, Kerala, India
 * Severity: high | medium | low
 * resolved: false by default (one is pre-resolved to show the lifecycle)
 */

const SEED_REPORTS = [
  {
    id: "seed-001",
    lat: 8.5241,
    lng: 76.9366,
    type: "broken_ramp",
    typeName: "Broken / Missing Ramp",
    description:
      "Wheelchair ramp at the main entrance to Secretariat complex is cracked and tilted. Gap between ramp and pavement edge is ~4 cm — hazardous for wheelchair users and parents with strollers.",
    severity: "high",
    confirmations: 7,
    timestamp: "2026-06-24T09:15:00+05:30",
    resolved: false,
  },
  {
    id: "seed-002",
    lat: 8.5219,
    lng: 76.9393,
    type: "poor_lighting",
    typeName: "Poor or No Lighting",
    description:
      "The pedestrian walkway between Palayam junction and the medical college gate is completely unlit after 8 PM. Multiple incidents of bag-snatching reported in this stretch.",
    severity: "high",
    confirmations: 9,
    timestamp: "2026-06-25T20:30:00+05:30",
    resolved: false,
  },
  {
    id: "seed-003",
    lat: 8.5265,
    lng: 76.9454,
    type: "unsafe_crossing",
    typeName: "Unsafe Road Crossing",
    description:
      "No pedestrian crossing signal at this 5-way junction near Kowdiar. Blind and visually impaired pedestrians have no audio cues. Traffic speed is high, especially on weekday mornings.",
    severity: "high",
    confirmations: 6,
    timestamp: "2026-06-22T08:00:00+05:30",
    resolved: false,
  },
  {
    id: "seed-004",
    lat: 8.5183,
    lng: 76.9488,
    type: "no_braille",
    typeName: "Missing Braille / Tactile Signage",
    description:
      "The new lift installed at Thampanoor bus stand has no Braille floor indicators or tactile guide strips. Visually impaired passengers cannot independently navigate between platforms.",
    severity: "high",
    confirmations: 5,
    timestamp: "2026-06-26T11:45:00+05:30",
    resolved: false,
  },
  {
    id: "seed-005",
    lat: 8.5208,
    lng: 76.9341,
    type: "missing_gnwashroom",
    typeName: "No Gender-Neutral Washroom",
    description:
      "Public washrooms at Overbridge junction are male/female only. No accessible single-occupancy option for trans individuals, those with disabilities requiring attendant help, or parents with opposite-sex children.",
    severity: "medium",
    confirmations: 4,
    timestamp: "2026-06-20T14:00:00+05:30",
    resolved: false,
  },
  {
    id: "seed-006",
    lat: 8.5302,
    lng: 76.9412,
    type: "broken_ramp",
    typeName: "Broken / Missing Ramp",
    description:
      "Curb cut on Sasthamangalam main road is blocked by a permanently parked KSRTC minibus. Effective access width is zero. No enforcement action taken despite repeated complaints.",
    severity: "medium",
    confirmations: 3,
    timestamp: "2026-06-23T07:30:00+05:30",
    resolved: false,
  },
  {
    id: "seed-007",
    lat: 8.5158,
    lng: 76.9310,
    type: "uneven_surface",
    typeName: "Uneven / Broken Surface",
    description:
      "Footpath tiles on Medical College Road are severely uneven with multiple broken slabs raised 5–8 cm above grade. Elderly pedestrians and anyone using a mobility aid is at significant fall risk.",
    severity: "medium",
    confirmations: 6,
    timestamp: "2026-06-18T16:20:00+05:30",
    resolved: false,
  },
  {
    id: "seed-008",
    lat: 8.5331,
    lng: 76.9372,
    type: "confusing_signage",
    typeName: "Confusing / Inaccessible Signage",
    description:
      "Exit signage inside the Chalai Market complex is only in Malayalam with no pictograms or English transliteration. International visitors and tourists frequently get disoriented and cannot locate emergency exits.",
    severity: "medium",
    confirmations: 2,
    timestamp: "2026-06-27T13:10:00+05:30",
    resolved: false,
  },
  {
    id: "seed-009",
    lat: 8.5146,
    lng: 76.9428,
    type: "poor_lighting",
    typeName: "Poor or No Lighting",
    description:
      "Street lights on the footbridge over the railway line near Vanchiyoor have been out for 3 weeks. The bridge is the only safe pedestrian crossing in this area — women report avoiding it after 7 PM.",
    severity: "high",
    confirmations: 8,
    timestamp: "2026-06-21T19:45:00+05:30",
    resolved: false,
  },
  {
    id: "seed-010",
    lat: 8.5277,
    lng: 76.9291,
    type: "no_braille",
    typeName: "Missing Braille / Tactile Signage",
    description:
      "ATM vestibule at the SBI branch near Bakery Junction has no audio instructions and no Braille keypad overlay. Visually impaired customers must rely on strangers for PIN entry — a major privacy and safety risk.",
    severity: "medium",
    confirmations: 4,
    timestamp: "2026-06-17T10:00:00+05:30",
    resolved: false,
  },
  {
    id: "seed-011",
    lat: 8.5192,
    lng: 76.9515,
    type: "unsafe_crossing",
    typeName: "Unsafe Road Crossing",
    description:
      "Zebra crossing paint near Pattom junction is completely worn off and invisible. Drivers do not yield. Elderly pedestrians and school children use this crossing daily during peak hours.",
    severity: "medium",
    confirmations: 5,
    timestamp: "2026-06-15T08:30:00+05:30",
    resolved: false,
  },
  {
    id: "seed-012",
    lat: 8.5354,
    lng: 76.9435,
    type: "uneven_surface",
    typeName: "Uneven / Broken Surface",
    description:
      "Construction debris on footpath near Vazhuthacaud junction narrows the walkable width to under 60 cm. Wheelchair users are forced onto the road. Debris has been here for over a month.",
    severity: "low",
    confirmations: 2,
    timestamp: "2026-06-28T12:00:00+05:30",
    resolved: false,
  },
  {
    id: "seed-013",
    lat: 8.5110,
    lng: 76.9382,
    type: "missing_gnwashroom",
    typeName: "No Gender-Neutral Washroom",
    description:
      "The newly renovated park at Veli Tourist Village has no accessible washroom. The existing facility has steps at the entrance with no ramp alternative — parents with strollers and wheelchair users cannot use it.",
    severity: "low",
    confirmations: 3,
    timestamp: "2026-06-19T11:00:00+05:30",
    resolved: false,
  },
  {
    id: "seed-014",
    lat: 8.5240,
    lng: 76.9460,
    type: "confusing_signage",
    typeName: "Confusing / Inaccessible Signage",
    description:
      "Hospital waiting room signage at the General Hospital uses medical jargon without plain-language alternatives. Non-literate patients and those with cognitive disabilities cannot navigate departments independently.",
    severity: "low",
    confirmations: 2,
    timestamp: "2026-06-28T09:30:00+05:30",
    resolved: true,
  },
  {
    id: "seed-015",
    lat: 8.5178,
    lng: 76.9345,
    type: "broken_ramp",
    typeName: "Broken / Missing Ramp",
    description:
      "The ramp at the south entrance of the Lulu Mall was reported as incomplete. Facility management confirmed it was repaired and retested on 2026-06-26 — marking as resolved. Confirming for record-keeping.",
    severity: "low",
    confirmations: 9,
    timestamp: "2026-06-10T15:00:00+05:30",
    resolved: true,
  },
];
