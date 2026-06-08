export type OfferOwner = "Magda 1" | "Magda 2";
export type OfferStatus = "sent" | "negotiation" | "measurement_done" | "won" | "lost";

export interface OfferRecord {
  id: string;
  clientName: string;
  owner: OfferOwner;
  model: "Tirana" | "Astana" | "Chaga" | "Waleta";
  leadTemperature: "HOT" | "WARM" | "COLD";
  value: number;
  status: OfferStatus;
  daysSinceSent: number;
  daysSinceFollowup: number;
  hoursSinceContact: number;
  measurementDone: boolean;
  decisionReason?: string;
}

export interface OfferAction {
  offerId: string;
  owner: OfferOwner;
  clientName: string;
  whatNow: string;
  whyNow: string;
  priority: "highest" | "high" | "medium";
  expectedImpact: string;
}

export interface Build016Snapshot {
  offers: OfferRecord[];
  pipeline: {
    inProgressCount: number;
    totalValue: number;
    nearCloseCount: number;
  };
  followupAlerts: OfferRecord[];
  agingRecovery: OfferRecord[];
  highValueAlerts: OfferRecord[];
  conversionSummary: {
    sent: number;
    won: number;
    lost: number;
    conversionPct: number;
    missingOutcomeReason: number;
  };
  nextBestActions: OfferAction[];
  forecastImpactNote: string;
}

const MOCK_OFFERS: OfferRecord[] = [
  {
    id: "OF-016-001",
    clientName: "Kamil Nowak",
    owner: "Magda 1",
    model: "Tirana",
    leadTemperature: "HOT",
    value: 72000,
    status: "negotiation",
    daysSinceSent: 4,
    daysSinceFollowup: 4,
    hoursSinceContact: 28,
    measurementDone: true,
  },
  {
    id: "OF-016-002",
    clientName: "Anna Zaremba",
    owner: "Magda 2",
    model: "Astana",
    leadTemperature: "WARM",
    value: 34000,
    status: "sent",
    daysSinceSent: 2,
    daysSinceFollowup: 2,
    hoursSinceContact: 20,
    measurementDone: false,
  },
  {
    id: "OF-016-003",
    clientName: "Joanna Kłos",
    owner: "Magda 2",
    model: "Waleta",
    leadTemperature: "HOT",
    value: 41000,
    status: "measurement_done",
    daysSinceSent: 5,
    daysSinceFollowup: 3,
    hoursSinceContact: 30,
    measurementDone: true,
  },
  {
    id: "OF-016-004",
    clientName: "Alicja Wrona",
    owner: "Magda 1",
    model: "Tirana",
    leadTemperature: "HOT",
    value: 66000,
    status: "sent",
    daysSinceSent: 1,
    daysSinceFollowup: 1,
    hoursSinceContact: 26,
    measurementDone: false,
  },
  {
    id: "OF-016-005",
    clientName: "Michał Bąk",
    owner: "Magda 1",
    model: "Chaga",
    leadTemperature: "WARM",
    value: 27000,
    status: "negotiation",
    daysSinceSent: 16,
    daysSinceFollowup: 8,
    hoursSinceContact: 190,
    measurementDone: true,
  },
  {
    id: "OF-016-006",
    clientName: "Rafał Pietrzak",
    owner: "Magda 2",
    model: "Tirana",
    leadTemperature: "HOT",
    value: 52000,
    status: "won",
    daysSinceSent: 6,
    daysSinceFollowup: 0,
    hoursSinceContact: 2,
    measurementDone: true,
    decisionReason: "Szybka decyzja po pomiarze i follow-upie",
  },
  {
    id: "OF-016-007",
    clientName: "Filip Mazur",
    owner: "Magda 1",
    model: "Astana",
    leadTemperature: "COLD",
    value: 22000,
    status: "lost",
    daysSinceSent: 9,
    daysSinceFollowup: 5,
    hoursSinceContact: 120,
    measurementDone: false,
  },
];

function isInProgress(status: OfferStatus): boolean {
  return status === "sent" || status === "negotiation" || status === "measurement_done";
}

function createNextActions(offers: OfferRecord[]): OfferAction[] {
  const actions: OfferAction[] = [];

  offers.forEach((offer) => {
    if (!isInProgress(offer.status)) {
      return;
    }

    if (offer.daysSinceFollowup > 3) {
      actions.push({
        offerId: offer.id,
        owner: offer.owner,
        clientName: offer.clientName,
        whatNow: "Wykonaj follow-up dzisiaj",
        whyNow: "Oferta bez follow-upu > 3 dni",
        priority: offer.value > 30000 ? "highest" : "high",
        expectedImpact: "Zmniejszenie ryzyka utraty oferty",
      });
    }

    if (offer.value > 30000) {
      actions.push({
        offerId: offer.id,
        owner: offer.owner,
        clientName: offer.clientName,
        whatNow: "Telefon priorytetowy do oferty premium",
        whyNow: "Oferta premium > 30 000 zł",
        priority: "high",
        expectedImpact: "Wysoki wpływ na forecast miesięczny",
      });
    }

    if (offer.leadTemperature === "HOT" && offer.hoursSinceContact > 24) {
      actions.push({
        offerId: offer.id,
        owner: offer.owner,
        clientName: offer.clientName,
        whatNow: "Telefon w trybie 24h",
        whyNow: "HOT lead z wysłaną ofertą wymaga kontaktu <= 24h",
        priority: "highest",
        expectedImpact: "Podniesienie szansy domknięcia",
      });
    }

    if (offer.measurementDone && offer.hoursSinceContact > 48) {
      actions.push({
        offerId: offer.id,
        owner: offer.owner,
        clientName: offer.clientName,
        whatNow: "Follow-up po pomiarze",
        whyNow: "Po pomiarze minęło > 48h bez kontaktu",
        priority: "high",
        expectedImpact: "Szybsze przejście do decyzji klienta",
      });
    }

    if (offer.daysSinceSent > 14 && offer.status !== "won" && offer.status !== "lost") {
      actions.push({
        offerId: offer.id,
        owner: offer.owner,
        clientName: offer.clientName,
        whatNow: "Uruchom tryb odzyskania oferty",
        whyNow: "Oferta starsza niż 14 dni bez decyzji",
        priority: "high",
        expectedImpact: "Odzyskanie wartości, która zaraz umrze",
      });
    }
  });

  const priorityOrder: Record<OfferAction["priority"], number> = {
    highest: 3,
    high: 2,
    medium: 1,
  };

  return actions.sort((left, right) => priorityOrder[right.priority] - priorityOrder[left.priority]).slice(0, 10);
}

export function createBuild016Snapshot(): Build016Snapshot {
  const offers = MOCK_OFFERS;
  const inProgressOffers = offers.filter((offer) => isInProgress(offer.status));

  const followupAlerts = inProgressOffers.filter((offer) => offer.daysSinceFollowup > 3);
  const agingRecovery = inProgressOffers.filter((offer) => offer.daysSinceSent > 14);
  const highValueAlerts = inProgressOffers.filter((offer) => offer.value > 30000);

  const nearCloseCount = inProgressOffers.filter(
    (offer) => offer.status === "negotiation" || (offer.status === "measurement_done" && offer.hoursSinceContact <= 48)
  ).length;

  const won = offers.filter((offer) => offer.status === "won").length;
  const lost = offers.filter((offer) => offer.status === "lost").length;
  const sent = offers.filter((offer) => offer.status === "sent" || offer.status === "negotiation" || offer.status === "measurement_done").length;

  const outcomeOffers = offers.filter((offer) => offer.status === "won" || offer.status === "lost");
  const missingOutcomeReason = outcomeOffers.filter((offer) => !offer.decisionReason || offer.decisionReason.trim().length === 0).length;

  return {
    offers,
    pipeline: {
      inProgressCount: inProgressOffers.length,
      totalValue: inProgressOffers.reduce((sum, offer) => sum + offer.value, 0),
      nearCloseCount,
    },
    followupAlerts,
    agingRecovery,
    highValueAlerts,
    conversionSummary: {
      sent,
      won,
      lost,
      conversionPct: won / Math.max(1, won + lost) * 100,
      missingOutcomeReason,
    },
    nextBestActions: createNextActions(offers),
    forecastImpactNote:
      "Domknięcie 2 ofert premium i usunięcie zaległych follow-upów może podnieść forecast o ~12-18% w tym miesiącu.",
  };
}
