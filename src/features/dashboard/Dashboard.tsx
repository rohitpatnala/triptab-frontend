import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  Text,
  Textarea,
  Title1,
  Title2,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Airplane24Regular,
  ArrowRight24Regular,
  People24Regular,
  Wallet24Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import type { TripDetails, TripMember } from "../../types";
import { createTrip, loadTrips, subscribeToTripChanges } from "../../services/api";
import { formatDate, formatINR } from "../../utils/currency";
import { calculateMemberBalances } from "../../utils/splitCalculator";
import "./Dashboard.css";

const memberColors = ["#0078D4", "#107C10", "#8764B8", "#D83B01", "#038387", "#5C2D91"];

function makeMember(name: string, index: number): TripMember {
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return { id: `member-${index}-${name.toLowerCase().replace(/\s+/g, "-")}`, name, initials, color: memberColors[index % memberColors.length], paidPaise: 0, sharePaise: 0, netPaise: 0 };
}

function getTotals(trips: TripDetails[]) {
  return trips.reduce((summary, trip) => {
    const total = trip.expenses.reduce((amount, expense) => amount + expense.amountPaise, 0);
    const you = calculateMemberBalances(trip).find((member) => member.name === "You" || member.id === "u1");
    return { total: summary.total + total, owed: summary.owed + Math.max(0, you?.netPaise ?? 0) };
  }, { total: 0, owed: 0 });
}

export default function Dashboard() {
  const [trips, setTrips] = useState<TripDetails[]>(() => loadTrips());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [memberNames, setMemberNames] = useState("You, Arjun");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => subscribeToTripChanges(() => setTrips(loadTrips())), []);

  const totals = useMemo(() => getTotals(trips), [trips]);

  function resetForm() {
    setTripName("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setMemberNames("You, Arjun");
    setError("");
  }

  function handleCreateTrip() {
    const names = memberNames.split(",").map((name) => name.trim()).filter(Boolean);
    if (!tripName.trim() || !destination.trim()) {
      setError("Trip name and destination are required.");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }
    if (names.length < 2 || names.length > 100) {
      setError("Add between 2 and 100 people, separated by commas.");
      return;
    }
    if (new Set(names.map((name) => name.toLowerCase())).size !== names.length) {
      setError("Each person should have a unique name.");
      return;
    }
    const trip = createTrip({ name: tripName.trim(), destination: destination.trim(), startDate, endDate, members: names.map(makeMember) });
    setTrips(loadTrips());
    setIsDialogOpen(false);
    resetForm();
    navigate(`/trips/${trip.id}`);
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-icon"><Wallet24Regular /></div>
          <div className="brand-copy"><Title2>TripTab</Title2><Text size={200}>Every trip. Every rupee. Sorted.</Text></div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(_, data) => { setIsDialogOpen(data.open); if (!data.open) resetForm(); }}>
          <Button appearance="primary" className="create-trip-button" icon={<Add24Regular />} onClick={() => setIsDialogOpen(true)}>Create new trip</Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Create a new trip</DialogTitle>
              <DialogContent>
                <div className="trip-form">
                  <Field label="Trip name" required><Input placeholder="e.g. Goa Getaway" value={tripName} onChange={(_, data) => setTripName(data.value)} /></Field>
                  <Field label="Destination" required><Input placeholder="e.g. Goa, India" value={destination} onChange={(_, data) => setDestination(data.value)} /></Field>
                  <div className="date-grid">
                    <Field label="Start date"><Input type="date" value={startDate} onChange={(_, data) => setStartDate(data.value)} /></Field>
                    <Field label="End date"><Input type="date" value={endDate} onChange={(_, data) => setEndDate(data.value)} /></Field>
                  </div>
                  <Field label="People" hint="Use commas to separate names" required><Textarea value={memberNames} onChange={(_, data) => setMemberNames(data.value)} placeholder="You, Arjun, Priya" /></Field>
                  {error && <Text className="form-error" role="alert">{error}</Text>}
                  <div className="dialog-actions">
                    <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button appearance="primary" onClick={handleCreateTrip}>Create trip</Button>
                  </div>
                </div>
              </DialogContent>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <Text className="eyebrow">YOUR TRAVEL FINANCES</Text>
          <Title1>Every adventure, accounted for.</Title1>
          <Text className="welcome-description">Track expenses, split bills, and settle up with your favourite people.</Text>
        </section>

        <section className="stats-grid">
          <Card className="stat-card"><CardHeader header={<Text weight="semibold">Total expenses</Text>} image={<div className="stat-icon blue"><Wallet24Regular /></div>} /><Title1>{formatINR(totals.total)}</Title1><Text size={200}>Across your trips</Text></Card>
          <Card className="stat-card"><CardHeader header={<Text weight="semibold">You are owed</Text>} image={<div className="stat-icon green"><ArrowRight24Regular /></div>} /><Title1 className="positive">{formatINR(totals.owed)}</Title1><Text size={200}>Your net balance</Text></Card>
          <Card className="stat-card"><CardHeader header={<Text weight="semibold">Your trips</Text>} image={<div className="stat-icon violet"><Airplane24Regular /></div>} /><Title1>{trips.length}</Title1><Text size={200}>Adventures and counting</Text></Card>
        </section>

        <section className="trips-section">
          <div className="section-heading"><div className="section-heading-copy"><Title2>Your adventures</Title2><Text size={200}>All your trips in one place</Text></div></div>
          {trips.length === 0 ? <Card className="empty-trips"><Airplane24Regular /><Title2>Your next adventure starts here</Title2><Text>Create a trip and start splitting expenses with your friends.</Text></Card> : <div className="trips-grid">{trips.map((trip) => {
            const total = trip.expenses.reduce((amount, expense) => amount + expense.amountPaise, 0);
            return <Card key={trip.id} className="trip-card">
              <div className="trip-card-top"><div className="trip-icon"><Airplane24Regular /></div><Text className="trip-badge">{trip.expenses.length ? "ACTIVE TRIP" : "READY TO SPLIT"}</Text></div>
              <Title2>{trip.name}</Title2><Text className="trip-destination">{trip.destination}</Text>
              <div className="trip-meta"><Text size={200}>{formatDate(trip.startDate)}</Text><Text size={200}><People24Regular />{trip.members.length} people</Text></div>
              <div className="trip-card-footer"><Text weight="semibold">{formatINR(total)} spent</Text><Button appearance="subtle" icon={<ArrowRight24Regular />} onClick={() => navigate(`/trips/${trip.id}`)}>Open trip</Button></div>
            </Card>;
          })}</div>}
        </section>
      </main>
    </div>
  );
}
