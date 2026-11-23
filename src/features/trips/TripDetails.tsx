import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  Input,
  Option,
  Text,
  Title2,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Airplane24Regular,
  ArrowLeft24Regular,
  ArrowSwap24Regular,
  Building24Regular,
  CalendarLtr24Regular,
  DrinkWine24Regular,
  Food24Regular,
  Gift24Regular,
  MoreHorizontal24Regular,
  People24Regular,
  Receipt24Regular,
  ShoppingBag24Regular,
  TicketDiagonal24Regular,
  VehicleBicycle24Regular,
} from "@fluentui/react-icons";
import { useNavigate, useParams } from "react-router-dom";
import type { ExpenseCategory, SplitMode, TripDetails, TripExpense } from "../../types";
import { addExpense, addMember, getTrip, subscribeToTripChanges } from "../../services/api";
import { formatDate, formatINR, rupeesToPaise } from "../../utils/currency";
import { calculateMemberBalances, calculateSettlements } from "../../utils/splitCalculator";
import "./TripDetails.css";

type CategoryConfig = { label: string; color: string; background: string; icon: ReactNode };
const categoryConfig: Record<ExpenseCategory, CategoryConfig> = {
  travel: { label: "Travel", color: "#0078D4", background: "#DEECF9", icon: <Airplane24Regular /> },
  food: { label: "Food", color: "#107C10", background: "#DFF6DD", icon: <Food24Regular /> },
  shopping: { label: "Shopping", color: "#8764B8", background: "#EFDCF9", icon: <ShoppingBag24Regular /> },
  alcohol: { label: "Drinks", color: "#D83B01", background: "#FDE7E9", icon: <DrinkWine24Regular /> },
  bike: { label: "Bike rental", color: "#CA5010", background: "#FCE4D6", icon: <VehicleBicycle24Regular /> },
  accommodation: { label: "Stay", color: "#5C2D91", background: "#EDE2F7", icon: <Building24Regular /> },
  tips: { label: "Tips", color: "#038387", background: "#DFF6F5", icon: <Gift24Regular /> },
  activities: { label: "Activities", color: "#C239B3", background: "#F9E2F5", icon: <TicketDiagonal24Regular /> },
  miscellaneous: { label: "Other", color: "#605E5C", background: "#F3F2F1", icon: <MoreHorizontal24Regular /> },
};
const categoryOptions = Object.entries(categoryConfig) as [ExpenseCategory, CategoryConfig][];

function memberName(trip: TripDetails, memberId: string): string {
  return trip.members.find((member) => member.id === memberId)?.name ?? "Unknown";
}

function getToday(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function ExpenseRow({ expense, trip }: { expense: TripExpense; trip: TripDetails }) {
  const category = categoryConfig[expense.category];
  const splitLabel = expense.splitMode === "percentages" ? "Percentages" : expense.splitMode === "shares" ? "Shares" : "Equal split";
  return <div className="expense-row">
    <div className="expense-category-icon" style={{ color: category.color, background: category.background }}>{category.icon}</div>
    <div className="expense-description"><Text weight="semibold">{expense.title}</Text><Text size={200}>{category.label} · Paid by {memberName(trip, expense.paidBy)} · {splitLabel}</Text></div>
    <div className="expense-amount"><Text weight="semibold">{formatINR(expense.amountPaise)}</Text><Text size={200}>{formatDate(expense.date)}</Text></div>
  </div>;
}

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripDetails | undefined>(() => tripId ? getTrip(tripId) : undefined);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("miscellaneous");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState(getToday());
  const [participants, setParticipants] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});
  const [memberNameInput, setMemberNameInput] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => subscribeToTripChanges(() => setTrip(tripId ? getTrip(tripId) : undefined)), [tripId]);

  useEffect(() => {
    if (!trip) return;
    setPaidBy((current) => current || trip.members[0]?.id || "");
    setParticipants((current) => current.length ? current : trip.members.map((member) => member.id));
  }, [trip]);

  const balances = useMemo(() => trip ? calculateMemberBalances(trip) : [], [trip]);
  const settlements = useMemo(() => calculateSettlements(balances), [balances]);
  const totalExpenses = trip?.expenses.reduce((total, expense) => total + expense.amountPaise, 0) ?? 0;
  const categoryTotals = trip?.expenses.reduce<Partial<Record<ExpenseCategory, number>>>((totals, expense) => {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amountPaise;
    return totals;
  }, {}) ?? {};
  const sortedExpenses = [...(trip?.expenses ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  function openExpenseDialog() {
    if (!trip) return;
    setTitle(""); setAmount(""); setCategory("miscellaneous"); setPaidBy(trip.members[0]?.id ?? ""); setDate(getToday()); setParticipants(trip.members.map((member) => member.id)); setSplitMode("equal"); setSplitValues({}); setFormError(""); setExpenseDialogOpen(true);
  }

  function toggleParticipant(memberId: string, checked: boolean) {
    setParticipants((current) => checked ? [...current, memberId] : current.filter((id) => id !== memberId));
  }

  function validateAndAddExpense() {
    if (!trip) return;
    const amountPaise = rupeesToPaise(amount);
    if (!title.trim() || amountPaise === null) { setFormError("Enter a title and a valid amount in INR."); return; }
    if (!paidBy || participants.length === 0) { setFormError("Choose who paid and at least one participant."); return; }
    const values = Object.fromEntries(participants.map((id) => [id, Number(splitValues[id] ?? "0")]));
    if (splitMode !== "equal" && participants.some((id) => !Number.isFinite(values[id]) || values[id] <= 0)) { setFormError("Every participant needs a value greater than zero."); return; }
    if (splitMode === "percentages" && Math.abs(Object.values(values).reduce((sum, value) => sum + value, 0) - 100) > 0.001) { setFormError("Percentage shares must add up to exactly 100%."); return; }
    const updated = addExpense(trip, { title: title.trim(), category, amountPaise, paidBy, date: date || getToday(), participants, splitMode, splitValues: splitMode === "equal" ? undefined : values });
    setTrip(updated); setExpenseDialogOpen(false);
  }

  function saveMember() {
    if (!trip || !memberNameInput.trim()) { setFormError("Enter a name for the new person."); return; }
    if (trip.members.some((member) => member.name.toLowerCase() === memberNameInput.trim().toLowerCase())) { setFormError("That person is already on this trip."); return; }
    const updated = addMember(trip, memberNameInput);
    setTrip(updated); setMemberNameInput(""); setFormError(""); setMemberDialogOpen(false);
  }

  if (!trip) return <div className="trip-details-page"><main className="trip-details-main"><Button icon={<ArrowLeft24Regular />} onClick={() => navigate("/")}>Back to overview</Button><Card className="trip-panel"><Title2>Trip not found</Title2><Text>This trip may have been removed from this browser.</Text></Card></main></div>;

  return <div className="trip-details-page">
    <header className="trip-details-toolbar"><Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate("/")}>Back to overview</Button><div className="trip-toolbar-actions"><Button appearance="secondary" onClick={() => { setFormError(""); setMemberDialogOpen(true); }}>Manage people</Button><Button appearance="primary" className="create-trip-button" icon={<Add24Regular />} onClick={openExpenseDialog}>Add expense</Button></div></header>
    <main className="trip-details-main">
      <section className="trip-details-heading"><div className="trip-title-icon"><Airplane24Regular /></div><div className="trip-heading-content"><Text className="trip-breadcrumb">MY TRIPS / TRIP OVERVIEW</Text><Title2 className="trip-main-title">{trip.name}</Title2><Text className="trip-destination">{trip.destination}</Text></div></section>
      <section className="trip-info-strip"><div><CalendarLtr24Regular /><span>{formatDate(trip.startDate)}{trip.endDate ? ` – ${formatDate(trip.endDate)}` : ""}</span></div><div><People24Regular /><span>{trip.members.length} participants</span></div><div className="trip-status">{trip.expenses.length ? "ACTIVE TRIP" : "READY TO SPLIT"}</div></section>
      <section className="trip-kpi-grid"><Card className="trip-kpi-card"><Text size={200}>Total trip expenses</Text><Title2>{formatINR(totalExpenses)}</Title2><Text size={200}>{trip.expenses.length} recorded expenses</Text></Card><Card className="trip-kpi-card"><Text size={200}>Participants</Text><Title2>{trip.members.length}</Title2><Text size={200}>Friends sharing this trip</Text></Card><Card className="trip-kpi-card"><Text size={200}>Average per person</Text><Title2>{formatINR(trip.members.length ? Math.round(totalExpenses / trip.members.length) : 0)}</Title2><Text size={200}>Equal-share reference</Text></Card></section>
      <div className="trip-content-grid">
        <section className="trip-panel expenses-panel"><div className="trip-panel-header"><div className="trip-section-heading"><Title2 className="trip-section-title">Expense timeline</Title2><Text className="trip-section-subtitle" size={200}>Track everything spent on this trip</Text></div><Button appearance="subtle" icon={<Receipt24Regular />} onClick={openExpenseDialog}>Add expense</Button></div><div className="expense-list">{sortedExpenses.length ? sortedExpenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} trip={trip} />) : <div className="empty-panel"><Receipt24Regular /><Text>No expenses yet. Add the first one above.</Text></div>}</div></section>
        <aside className="trip-side-panels">
          <section className="trip-panel"><div className="trip-panel-header"><div className="trip-section-heading"><Title2 className="trip-section-title">People</Title2><Text className="trip-section-subtitle" size={200}>Balances after every expense</Text></div><Button appearance="subtle" icon={<People24Regular />} onClick={() => setMemberDialogOpen(true)}>Add</Button></div><div className="member-list">{balances.map((member) => <div className="member-row" key={member.id}><div className="member-avatar" style={{ background: member.color }}>{member.initials}</div><div className="member-info"><Text weight="semibold">{member.name}</Text><Text size={200}>{member.netPaise >= 0 ? "Gets back" : "Owes"} · paid {formatINR(member.paidPaise)}</Text></div><Text className={member.netPaise >= 0 ? "balance-positive" : "balance-negative"} weight="semibold">{formatINR(Math.abs(member.netPaise))}</Text></div>)}</div></section>
          <section className="trip-panel"><div className="trip-panel-header"><div className="trip-section-heading"><Title2 className="trip-section-title">Settle up</Title2><Text className="trip-section-subtitle" size={200}>The fewest transfers to clear balances</Text></div><ArrowSwap24Regular /></div>{settlements.length ? <div className="settlement-list">{settlements.map((settlement) => <div className="settlement-row" key={`${settlement.from}-${settlement.to}`}><Text><strong>{memberName(trip, settlement.from)}</strong> pays <strong>{memberName(trip, settlement.to)}</strong></Text><Text weight="semibold">{formatINR(settlement.amountPaise)}</Text></div>)}</div> : <div className="empty-panel"><Text>Everyone is settled up.</Text></div>}</section>
          <section className="trip-panel"><div className="trip-panel-header"><div className="trip-section-heading"><Title2 className="trip-section-title">Spending breakdown</Title2><Text className="trip-section-subtitle" size={200}>By expense category</Text></div></div><div className="category-breakdown">{Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([key, amount]) => { const item = categoryConfig[key as ExpenseCategory]; const percent = totalExpenses ? (amount / totalExpenses) * 100 : 0; return <div className="category-item" key={key}><div className="category-item-header"><div className="category-label"><span className="category-dot" style={{ background: item.color }} /><Text>{item.label}</Text></div><Text weight="semibold">{formatINR(amount)}</Text></div><div className="category-progress"><div className="category-progress-fill" style={{ width: `${percent}%`, background: item.color }} /></div></div>; })}</div></section>
        </aside>
      </div>
    </main>

    <Dialog open={expenseDialogOpen} onOpenChange={(_, data) => setExpenseDialogOpen(data.open)}><DialogSurface><DialogBody><DialogTitle>Add an expense</DialogTitle><DialogContent><div className="expense-form">
      <Field label="What was it?" required><Input placeholder="e.g. Dinner at the beach" value={title} onChange={(_, data) => setTitle(data.value)} /></Field>
      <div className="form-two-columns"><Field label="Amount (INR)" required><Input type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(_, data) => setAmount(data.value)} /></Field><Field label="Date"><Input type="date" value={date} onChange={(_, data) => setDate(data.value)} /></Field></div>
      <div className="form-two-columns"><Field label="Category"><Dropdown value={categoryConfig[category].label} onOptionSelect={(_, data) => setCategory((data.optionValue ?? "miscellaneous") as ExpenseCategory)}>{categoryOptions.map(([key, item]) => <Option key={key} value={key}>{item.label}</Option>)}</Dropdown></Field><Field label="Paid by"><Dropdown value={memberName(trip, paidBy)} onOptionSelect={(_, data) => setPaidBy(data.optionValue ?? "")}>{trip.members.map((member) => <Option key={member.id} value={member.id}>{member.name}</Option>)}</Dropdown></Field></div>
      <Field label="Split method"><Dropdown value={splitMode === "equal" ? "Equal split" : splitMode === "shares" ? "Shares" : "Percentages"} onOptionSelect={(_, data) => { const mode = (data.optionValue ?? "equal") as SplitMode; setSplitMode(mode); setSplitValues({}); }}><Option value="equal">Equal split</Option><Option value="shares">Custom shares</Option><Option value="percentages">Percentages</Option></Dropdown></Field>
      <div className="participant-picker"><Text weight="semibold">Who shares this expense?</Text>{trip.members.map((member) => <div className="participant-row" key={member.id}><Checkbox checked={participants.includes(member.id)} label={member.name} onChange={(_, data) => toggleParticipant(member.id, Boolean(data.checked))} />{splitMode !== "equal" && participants.includes(member.id) && <Input className="split-value-input" type="number" min="0" step="0.01" placeholder={splitMode === "percentages" ? "0%" : "1"} value={splitValues[member.id] ?? ""} onChange={(_, data) => setSplitValues((current) => ({ ...current, [member.id]: data.value }))} />}</div>)}</div>
      {formError && <Text className="form-error" role="alert">{formError}</Text>}<div className="dialog-actions"><Button appearance="secondary" onClick={() => setExpenseDialogOpen(false)}>Cancel</Button><Button appearance="primary" onClick={validateAndAddExpense}>Save expense</Button></div>
    </div></DialogContent></DialogBody></DialogSurface></Dialog>

    <Dialog open={memberDialogOpen} onOpenChange={(_, data) => setMemberDialogOpen(data.open)}><DialogSurface><DialogBody><DialogTitle>Manage people</DialogTitle><DialogContent><div className="expense-form"><Text>Add someone to this trip. New people can be included in future expenses.</Text><Field label="Name" required><Input placeholder="e.g. Vikram" value={memberNameInput} onChange={(_, data) => setMemberNameInput(data.value)} /></Field>{formError && <Text className="form-error" role="alert">{formError}</Text>}<div className="dialog-actions"><Button appearance="secondary" onClick={() => setMemberDialogOpen(false)}>Close</Button><Button appearance="primary" onClick={saveMember}>Add person</Button></div></div></DialogContent></DialogBody></DialogSurface></Dialog>
  </div>;
}
