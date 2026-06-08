export type ProductionPriority = "critical" | "high" | "medium" | "low";
export type ProductionStatus = "queued" | "in_progress" | "ready_for_dispatch" | "blocked";
export type HandoffStatus = "completed" | "incomplete" | "waiting_for_sales";
export type RiskSeverity = "danger" | "warning" | "gold";

export interface ProductionOrder {
  id: string;
  clientName: string;
  modelName: string;
  salesperson: string;
  plannedStart: string;
  deadline: string;
  status: ProductionStatus;
  priority: ProductionPriority;
  technicalDataComplete: boolean;
  handoffStatus: HandoffStatus;
  estimatedValue: number;
}

export interface ProductionRisk {
  id: string;
  orderId: string;
  clientName: string;
  reason: string;
  severity: RiskSeverity;
  delayDays: number;
  owner: string;
}

export interface HandoffItem {
  orderId: string;
  clientName: string;
  salesperson: string;
  productionOwner: string;
  status: HandoffStatus;
  missingFields: string[];
  updatedAt: string;
}

export interface Build011Snapshot {
  productionQueue: ProductionOrder[];
  handoffItems: HandoffItem[];
  risks: ProductionRisk[];
  alerts: Array<{
    title: string;
    description: string;
    severity: RiskSeverity;
    metric: string;
  }>;
  totals: {
    inProduction: number;
    dueThisWeek: number;
    delayedRisk: number;
    missingTechnicalData: number;
    incompleteHandoffs: number;
    criticalAlerts: number;
  };
}

const MOCK_ORDERS: ProductionOrder[] = [
  {
    id: "PO-2026-041",
    clientName: "Nordline Invest",
    modelName: "Adezo Prime 200",
    salesperson: "Magda K",
    plannedStart: "2026-06-06",
    deadline: "2026-06-19",
    status: "in_progress",
    priority: "critical",
    technicalDataComplete: false,
    handoffStatus: "incomplete",
    estimatedValue: 148000,
  },
  {
    id: "PO-2026-042",
    clientName: "Bergson Logistics",
    modelName: "Adezo Flex 160",
    salesperson: "Magda B",
    plannedStart: "2026-06-07",
    deadline: "2026-06-20",
    status: "queued",
    priority: "high",
    technicalDataComplete: true,
    handoffStatus: "completed",
    estimatedValue: 112000,
  },
  {
    id: "PO-2026-043",
    clientName: "Metris Group",
    modelName: "Adezo Prime 220",
    salesperson: "Patryk S",
    plannedStart: "2026-06-08",
    deadline: "2026-06-23",
    status: "blocked",
    priority: "critical",
    technicalDataComplete: false,
    handoffStatus: "waiting_for_sales",
    estimatedValue: 196000,
  },
  {
    id: "PO-2026-044",
    clientName: "Novum Retail",
    modelName: "Adezo Line 120",
    salesperson: "Magda K",
    plannedStart: "2026-06-08",
    deadline: "2026-06-16",
    status: "in_progress",
    priority: "high",
    technicalDataComplete: true,
    handoffStatus: "completed",
    estimatedValue: 87000,
  },
  {
    id: "PO-2026-045",
    clientName: "Riva Development",
    modelName: "Adezo Flex 180",
    salesperson: "Magda B",
    plannedStart: "2026-06-09",
    deadline: "2026-06-21",
    status: "queued",
    priority: "medium",
    technicalDataComplete: false,
    handoffStatus: "incomplete",
    estimatedValue: 132000,
  },
  {
    id: "PO-2026-046",
    clientName: "Solis Park",
    modelName: "Adezo Compact 90",
    salesperson: "Patryk S",
    plannedStart: "2026-06-10",
    deadline: "2026-06-27",
    status: "ready_for_dispatch",
    priority: "low",
    technicalDataComplete: true,
    handoffStatus: "completed",
    estimatedValue: 64000,
  },
];

function getDaysToDate(date: string): number {
  const today = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function createHandoffItems(orders: ProductionOrder[]): HandoffItem[] {
  return orders.map((order, index) => {
    const missingFields: string[] = [];

    if (!order.technicalDataComplete) {
      missingFields.push("specyfikacja techniczna");
      missingFields.push("potwierdzenie wymiarów");
    }

    if (order.handoffStatus !== "completed") {
      missingFields.push("akceptacja produkcji");
    }

    return {
      orderId: order.id,
      clientName: order.clientName,
      salesperson: order.salesperson,
      productionOwner: index % 2 === 0 ? "Brygadzista A" : "Brygadzista B",
      status: order.handoffStatus,
      missingFields,
      updatedAt: `2026-06-${String(8 - (index % 3)).padStart(2, "0")}`,
    };
  });
}

function createRisks(orders: ProductionOrder[]): ProductionRisk[] {
  return orders
    .filter((order) => order.status === "blocked" || !order.technicalDataComplete || getDaysToDate(order.deadline) <= 5)
    .map((order, index) => {
      const isBlocked = order.status === "blocked";
      const missingTech = !order.technicalDataComplete;
      const closeDeadline = getDaysToDate(order.deadline) <= 5;

      const reason = isBlocked
        ? "Zablokowane zamówienie na etapie przygotowania"
        : missingTech
          ? "Braki w danych technicznych z handlowca"
          : "Termin graniczny poniżej 5 dni";

      const severity: RiskSeverity = isBlocked || (missingTech && closeDeadline)
        ? "danger"
        : closeDeadline
          ? "warning"
          : "gold";

      return {
        id: `RISK-${index + 1}`,
        orderId: order.id,
        clientName: order.clientName,
        reason,
        severity,
        delayDays: isBlocked ? 4 : closeDeadline ? 2 : 1,
        owner: "Production PM",
      };
    });
}

export function createBuild011Snapshot(): Build011Snapshot {
  const productionQueue = MOCK_ORDERS;
  const handoffItems = createHandoffItems(productionQueue);
  const risks = createRisks(productionQueue);

  const inProduction = productionQueue.filter((order) => order.status === "in_progress" || order.status === "blocked").length;
  const dueThisWeek = productionQueue.filter((order) => getDaysToDate(order.deadline) <= 7).length;
  const delayedRisk = risks.filter((risk) => risk.severity === "danger" || risk.severity === "warning").length;
  const missingTechnicalData = productionQueue.filter((order) => !order.technicalDataComplete).length;
  const incompleteHandoffs = handoffItems.filter((item) => item.status !== "completed").length;
  const criticalAlerts = risks.filter((risk) => risk.severity === "danger").length;

  const alerts: Build011Snapshot["alerts"] = [];

  if (criticalAlerts > 0) {
    alerts.push({
      title: "Krytyczne ryzyka produkcji",
      description: "W produkcji znajdują się zamówienia z wysokim ryzykiem opóźnienia lub blokadą.",
      severity: "danger",
      metric: `${criticalAlerts} krytyczne`,
    });
  }

  if (missingTechnicalData > 0) {
    alerts.push({
      title: "Braki danych technicznych",
      description: "Część zamówień nie ma pełnej dokumentacji przekazanej z handlowca.",
      severity: "warning",
      metric: `${missingTechnicalData} zamówień`,
    });
  }

  if (incompleteHandoffs > 0) {
    alerts.push({
      title: "Niepełne przekazanie Sales → Production",
      description: "Order handoff nie jest zakończony dla wszystkich aktywnych zamówień.",
      severity: "gold",
      metric: `${incompleteHandoffs} handoff`,
    });
  }

  return {
    productionQueue,
    handoffItems,
    risks,
    alerts,
    totals: {
      inProduction,
      dueThisWeek,
      delayedRisk,
      missingTechnicalData,
      incompleteHandoffs,
      criticalAlerts,
    },
  };
}
