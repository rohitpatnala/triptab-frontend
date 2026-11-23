
import type { TripDetails } from "../../types";

export const demoTrip: TripDetails = {
  id: "demo-trip",
  name: "Goa Getaway",
  destination: "Goa, India",
  startDate: "2026-11-20",
  endDate: "2026-11-23",

  
members: [
  {
    id: "u1",
    name: "You",
    initials: "YO",
    color: "#0078D4",
    paidPaise: 400000,
    sharePaise: 201000,
    netPaise: 199000,
  },
  {
    id: "u2",
    name: "Arjun",
    initials: "AR",
    color: "#107C10",
    paidPaise: 185000,
    sharePaise: 201000,
    netPaise: -16000,
  },
  {
    id: "u3",
    name: "Priya",
    initials: "PR",
    color: "#8764B8",
    paidPaise: 125000,
    sharePaise: 201000,
    netPaise: -76000,
  },
  {
    id: "u4",
    name: "Rahul",
    initials: "RA",
    color: "#D83B01",
    paidPaise: 195000,
    sharePaise: 201000,
    netPaise: -6000,
  },
  {
    id: "u5",
    name: "Sneha",
    initials: "SN",
    color: "#038387",
    paidPaise: 100000,
    sharePaise: 201000,
    netPaise: -101000,
  },
],


  expenses: [
    {
      id: "e1",
      title: "Airport transfers",
      category: "travel",
      amountPaise: 240000,
      paidBy: "u1",
      date: "2026-11-20",
      participants: ["u1", "u2", "u3", "u4", "u5"],
    },
    {
      id: "e2",
      title: "Beachside lunch",
      category: "food",
      amountPaise: 185000,
      paidBy: "u2",
      date: "2026-11-20",
      participants: ["u1", "u2", "u3", "u4", "u5"],
    },
    {
      id: "e3",
      title: "Scooter rental",
      category: "bike",
      amountPaise: 90000,
      paidBy: "u1",
      date: "2026-11-21",
      participants: ["u1", "u2", "u3"],
    },
    {
      id: "e4",
      title: "Dinner & drinks",
      category: "alcohol",
      amountPaise: 365000,
      paidBy: "u4",
      date: "2026-11-21",
      participants: ["u1", "u2", "u3", "u4", "u5"],
    },
    {
      id: "e5",
      title: "Flea market finds",
      category: "shopping",
      amountPaise: 125000,
      paidBy: "u3",
      date: "2026-11-22",
      participants: ["u3"],
    },
  ],
};
