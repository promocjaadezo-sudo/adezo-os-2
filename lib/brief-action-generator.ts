import type { BriefRuleFinding } from "@/lib/brief-priority-rules";

export interface BriefAction {
  id: string;
  recipient: "CEO" | "Magda 1" | "Magda 2" | "Marketing";
  priority: "critical" | "high" | "medium";
  task: string;
  owner: string;
  deadline: string;
  expectedEffect: string;
  dataSources: Array<"GA4" | "Google Ads" | "Excel CRM" | "Revenue Truth Layer">;
}

function deadlineForPriority(priority: BriefAction["priority"]): string {
  if (priority === "critical") return "Dzisiaj 14:00";
  if (priority === "high") return "Dzisiaj 17:00";
  return "Jutro 12:00";
}

function taskByRule(rule: BriefRuleFinding, recipient: BriefAction["recipient"]): string {
  switch (rule.code) {
    case "PLAN_GAP":
      if (recipient === "CEO") return "Uruchom plan recovery i potwierdź 3 priorytety dnia.";
      if (recipient === "Marketing") return "Przenieś budżet do kampanii z najwyższym ROAS.";
      return "Domknij najwyżej rokujące oferty i follow-upy.";
    case "CAMPAIGN_COST_NO_SALES":
      return recipient === "Marketing"
        ? "Wstrzymaj lub skoryguj kampanie z kosztem bez sprzedaży."
        : "Zweryfikuj ROI i zatwierdź decyzję budget shift.";
    case "HOT_LEAD_NO_CONTACT":
      return "Skontaktuj wszystkie HOT leady w oknie <2h i ustaw next step.";
    case "OFFER_FOLLOWUP_DELAY":
      return "Zrób follow-up ofert zaległych >3 dni i ustaw datę decyzji.";
    case "HIGH_VALUE_VISIBILITY":
      return "Przegląd szans >30k i wsparcie domknięcia 1-2 top okazji.";
    case "CRM_DATA_INCOMPLETE":
      return recipient === "CEO"
        ? "Wymuś dyscyplinę danych CRM i potwierdź ownerów uzupełnień."
        : "Uzupełnij brakujące pola CRM (status, owner, daty, wynik).";
    case "TIRANA_LEADS_NO_SALES":
      return recipient === "Marketing"
        ? "Review kampanii Tirana: jakość leadów, target i komunikat."
        : "Review oferty/follow-up dla leadów Tirana bez sprzedaży.";
    default:
      return "Wykonaj działanie operacyjne zgodnie z briefem.";
  }
}

function expectedEffectByRule(rule: BriefRuleFinding): string {
  switch (rule.code) {
    case "PLAN_GAP":
      return "Zmniejszenie luki do planu i podniesienie forecastu.";
    case "CAMPAIGN_COST_NO_SALES":
      return "Redukcja przepalania budżetu i poprawa ROAS.";
    case "HOT_LEAD_NO_CONTACT":
      return "Wyższa konwersja lead -> oferta.";
    case "OFFER_FOLLOWUP_DELAY":
      return "Wyższa konwersja oferta -> sprzedaż.";
    case "HIGH_VALUE_VISIBILITY":
      return "Szybsze domknięcia okazji premium >30k.";
    case "CRM_DATA_INCOMPLETE":
      return "Lepsza jakość danych i trafniejsze decyzje dzienne.";
    case "TIRANA_LEADS_NO_SALES":
      return "Uszczelnienie lejka Tirana i wzrost sprzedaży.";
    default:
      return "Wzrost skuteczności operacyjnej.";
  }
}

export function generateBriefActions(findings: BriefRuleFinding[]): BriefAction[] {
  const actions: BriefAction[] = [];

  findings.forEach((finding, index) => {
    finding.owners.forEach((recipient) => {
      actions.push({
        id: `${finding.code}-${recipient}-${index}`,
        recipient,
        priority: finding.priority,
        task: taskByRule(finding, recipient),
        owner: recipient,
        deadline: deadlineForPriority(finding.priority),
        expectedEffect: expectedEffectByRule(finding),
        dataSources: finding.dataSources,
      });
    });
  });

  return actions.sort((left, right) => {
    const rank = { critical: 0, high: 1, medium: 2 };
    return rank[left.priority] - rank[right.priority];
  });
}
