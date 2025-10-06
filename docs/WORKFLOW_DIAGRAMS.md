# 🎯 Soul Train's Eatery - Workflow Diagrams

Complete visual documentation of all customer and admin workflows with status transitions.

---

## **1. Simple Quote Approval Flow**

```mermaid
graph TD
    A[Customer Submits Quote] --> B[Admin Reviews]
    B --> C{Generate Estimate}
    C --> D[Send to Customer]
    D --> E[Customer Views Estimate]
    E --> F{Customer Decision}
    F -->|Approve| G[Payment Collected]
    F -->|Request Changes| H[Change Request Flow]
    G --> I[Event Confirmed]
    I --> J[Event Day]
    J --> K[Event Completed]

    style A fill:#e3f2fd
    style G fill:#c8e6c9
    style K fill:#81c784
```

**Status Transitions:**
- Quote: `pending` → `estimated` → `confirmed` → `completed`
- Invoice: `draft` → `sent` → `approved` → `paid`

---

## **2. Change Request Flow**

```mermaid
graph TD
    A[Customer Views Estimate] --> B{Wants Changes?}
    B -->|No| C[Approve Estimate]
    B -->|Yes| D[Submit Change Request]
    D --> E[Admin Reviews Request]
    E --> F{Cost Impact}
    F -->|< 5% Change| G[Auto-Approve]
    F -->|> 5% Change| H[Manual Review]
    G --> I[Apply Changes to Quote]
    H --> J{Admin Decision}
    J -->|Approve| I
    J -->|Reject| K[Notify Customer]
    I --> L[Create New Estimate Version]
    L --> M[Send Updated Estimate]
    M --> N{Same Access Link}
    N --> O[Customer Reviews v2]
    O --> P{Customer Decision}
    P -->|Approve| Q[Payment Flow]
    P -->|More Changes| D

    style G fill:#c8e6c9
    style K fill:#ffcdd2
    style N fill:#fff9c4
```

**Key Features:**
- ✅ Same customer access token persists across versions
- ✅ Estimate version history maintained
- ✅ Smart auto-approval for minor changes (<5%)
- ✅ Database trigger recalculates totals automatically

---

## **3. Payment Milestone Flow**

```mermaid
graph TD
    A[Estimate Approved] --> B[Generate Payment Milestones]
    B --> C[50% Deposit]
    B --> D[50% Final Payment]
    C --> E[Send Payment Link 1]
    E --> F{Customer Pays Deposit}
    F -->|Success| G[Mark Milestone 1 Paid]
    F -->|Failed| H[Retry Payment]
    G --> I[Update Invoice Status]
    I --> J[Event Approaches]
    J --> K[Send Payment Link 2]
    K --> L{Customer Pays Final}
    L -->|Success| M[Mark Milestone 2 Paid]
    L -->|Failed| N[Overdue Notice]
    M --> O[Invoice Status: Paid]
    O --> P[Quote Status: Confirmed]

    style G fill:#c8e6c9
    style M fill:#81c784
    style O fill:#4caf50
```

**Payment Statuses:**
- Milestone: `pending` → `paid`
- Invoice: `sent` → `approved` → `paid`
- Quote: `estimated` → `confirmed`

---

## **4. Government Contract Flow**

```mermaid
graph TD
    A[Gov Quote Submitted] --> B[Check Compliance Level]
    B --> C{Requires PO Number?}
    C -->|Yes| D[Request PO Number]
    C -->|No| E[Generate Estimate]
    D --> F{PO Provided?}
    F -->|Yes| E
    F -->|No| G[Cannot Proceed]
    E --> H[Apply Tax Exemption]
    H --> I[Set Payment Terms: NET30]
    I --> J[Send Estimate]
    J --> K[Customer Approves]
    K --> L[Generate Contract]
    L --> M[Contract Signed]
    M --> N[Event Confirmed]
    N --> O[Invoice After Event]
    O --> P[Payment Due 30 Days]

    style H fill:#fff9c4
    style I fill:#fff9c4
    style M fill:#c8e6c9
```

**Government-Specific Rules:**
- ✅ Tax rate = 0% (exempt)
- ✅ PO number required and validated
- ✅ NET30 payment terms
- ✅ Compliance level: `government`

---

## **5. Status Transition State Machine**

### Quote Workflow Status

```mermaid
stateDiagram-v2
    [*] --> pending: Customer Submits
    pending --> estimated: Admin Creates Estimate
    estimated --> confirmed: Payment Received + Contract Signed
    confirmed --> completed: Event Day Passed
    
    pending --> cancelled: Admin Cancels
    estimated --> cancelled: Customer Declines
    
    completed --> [*]
    cancelled --> [*]
```

**Valid Transitions:**
- `pending` → `estimated` | `cancelled`
- `estimated` → `confirmed` | `cancelled`
- `confirmed` → `completed`

### Invoice Workflow Status

```mermaid
stateDiagram-v2
    [*] --> draft: Admin Creates
    draft --> sent: Admin Sends to Customer
    sent --> approved: Customer Approves
    sent --> pending_review: Change Requested
    pending_review --> sent: Changes Applied
    approved --> paid: Payment Received
    
    sent --> overdue: Past Due Date
    overdue --> paid: Late Payment
    
    draft --> cancelled: Admin Cancels
    sent --> cancelled: Customer Declines
    
    paid --> [*]
    cancelled --> [*]
```

**Valid Transitions:**
- `draft` → `sent` | `cancelled`
- `sent` → `approved` | `pending_review` | `overdue` | `cancelled`
- `pending_review` → `sent`
- `approved` → `paid`
- `overdue` → `paid`

---

## **6. Email Notification Flow**

```mermaid
graph TD
    A[Trigger Event] --> B{Event Type}
    B -->|Quote Submitted| C[Welcome Email]
    B -->|Estimate Ready| D[Estimate Ready Email]
    B -->|Change Approved| E[Updated Estimate Email]
    B -->|Change Rejected| F[Rejection Email]
    B -->|Payment Due| G[Payment Reminder]
    B -->|Contract Ready| H[Contract Email]
    
    C --> I[Gmail API]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J{Deliverability Check}
    J -->|Success| K[Log Email Sent]
    J -->|Failed| L[Retry Queue]
    L --> M{Max Retries?}
    M -->|No| I
    M -->|Yes| N[Alert Admin]

    style K fill:#c8e6c9
    style N fill:#ffcdd2
```

**Email Types:**
1. **Welcome** - Quote submission confirmation
2. **Estimate Ready** - Custom estimate prepared
3. **Change Response** - Approved or rejected changes
4. **Payment Reminder** - Milestone due soon
5. **Contract Ready** - Contract signature required
6. **Event Reminder** - 3 days & 1 day before event

---

## **7. Automated Workflow Manager**

```mermaid
graph TD
    A[Cron Job: Every 15 min] --> B[Auto-Workflow-Manager]
    B --> C[Check Overdue Invoices]
    B --> D[Check Paid Invoices]
    B --> E[Check Completed Events]
    B --> F[Check Payment Reminders]
    
    C --> G{Past Due Date?}
    G -->|Yes| H[Mark as Overdue]
    G -->|No| I[Skip]
    
    D --> J{Contract Signed?}
    J -->|Yes| K[Confirm Event]
    J -->|No| L[Skip]
    
    E --> M{Event Date Passed?}
    M -->|Yes| N[Mark Completed]
    M -->|No| O[Skip]
    
    F --> P{Payment Due in 3 Days?}
    P -->|Yes| Q[Send Reminder Email]
    P -->|No| R[Skip]
    
    H --> S[Log State Change]
    K --> S
    N --> S
    Q --> T[Log Email Sent]

    style B fill:#e3f2fd
    style S fill:#fff9c4
```

**Automation Schedule:**
- **Every 15 minutes**: Check for status transitions
- **Daily at 2 AM**: Token renewal check
- **Automated Actions**:
  - Mark overdue invoices
  - Confirm paid events
  - Complete past events
  - Send payment reminders

---

## **8. Customer Access Token Lifecycle**

```mermaid
graph TD
    A[Estimate Created] --> B[Generate UUID Token]
    B --> C[Set Expiry: 1 Year]
    C --> D[Customer Receives Link]
    D --> E{Customer Actions}
    
    E -->|View Estimate| F[Token Validated]
    E -->|Request Changes| G[Token Persists]
    E -->|Approve| H[Token Persists]
    
    F --> I{Token Valid?}
    I -->|Yes| J[Show Estimate]
    I -->|No| K[Show Expired Message]
    
    G --> L[Admin Approves Changes]
    L --> M[Same Token Used]
    M --> N[New Estimate Version]
    N --> D
    
    H --> O[Payment Flow]
    O --> D

    style B fill:#fff9c4
    style M fill:#c8e6c9
```

**Token Rules:**
- ✅ Generated once on first estimate
- ✅ Never regenerated (even after changes)
- ✅ 1-year expiry from creation
- ✅ Used in URL: `/estimate?token={uuid}`

---

## **9. Database Trigger Flow**

```mermaid
graph TD
    A[Line Item Change] --> B[Trigger: recalculate_invoice_totals]
    B --> C[Sum All Line Items]
    C --> D{Government Contract?}
    D -->|Yes| E[Tax = $0.00]
    D -->|No| F[Tax = 8%]
    E --> G[Calculate Total]
    F --> G
    G --> H[Update Invoice Record]
    H --> I[Log to Audit Trail]
    I --> J[Realtime Subscription]
    J --> K[Frontend Updates]

    style B fill:#e3f2fd
    style K fill:#c8e6c9
```

**Trigger Events:**
- Line item added
- Line item quantity changed
- Line item deleted
- Line item price updated

**Calculations:**
- `subtotal` = SUM(line_items.total_price)
- `tax_amount` = `is_gov` ? 0 : subtotal * 0.08
- `total_amount` = subtotal + tax_amount

---

## **10. Multi-Change Cycle Flow**

```mermaid
sequenceDiagram
    participant C as Customer
    participant P as Portal
    participant A as Admin
    participant DB as Database
    participant E as Email

    C->>P: View Estimate v1
    C->>P: Request Change #1
    P->>DB: Create change_request
    DB->>A: Notify Admin
    A->>DB: Approve & Apply
    DB->>DB: Create estimate_version v2
    DB->>E: Send email to customer
    E->>C: "Updated Estimate Ready" (same link)
    
    C->>P: View Estimate v2 (same token)
    C->>P: Request Change #2
    P->>DB: Create change_request
    DB->>A: Notify Admin
    A->>DB: Approve & Apply
    DB->>DB: Create estimate_version v3
    DB->>E: Send email to customer
    E->>C: "Updated Estimate Ready" (same link)
    
    C->>P: View Estimate v3 (same token)
    C->>P: Approve Final Estimate
    P->>DB: Update invoice status
    DB->>E: Send payment instructions
    E->>C: "Payment Link"

    Note over C,E: Same customer_access_token throughout
    Note over DB: All versions tracked in estimate_versions
```

---

## **Status Color Coding**

| Status | Color | Meaning |
|--------|-------|---------|
| `pending` | 🔴 Red | Requires action |
| `estimated` | 🟡 Yellow | Awaiting customer |
| `confirmed` | 🟢 Green | Active/approved |
| `paid` | 🟢 Dark Green | Payment complete |
| `completed` | ✅ Check | Event finished |
| `cancelled` | ⚫ Gray | Inactive |
| `overdue` | 🔴 Red Alert | Urgent action needed |

---

## **Quick Reference: Who Can Do What**

### Customer Actions
- ✅ Submit quote request
- ✅ View estimate (via access token)
- ✅ Request changes
- ✅ Approve estimate
- ✅ Make payments
- ✅ Sign contract
- ❌ Edit pricing
- ❌ Change workflow status manually

### Admin Actions
- ✅ Review quote requests
- ✅ Create/edit estimates
- ✅ Approve/reject change requests
- ✅ Send emails
- ✅ Process payments
- ✅ Generate contracts
- ✅ Override workflow status
- ✅ View audit logs

### System (Automated)
- ✅ Mark overdue invoices
- ✅ Confirm paid events
- ✅ Complete past events
- ✅ Send reminders
- ✅ Recalculate totals
- ✅ Log all state changes
- ❌ Approve change requests (requires admin)
- ❌ Process refunds (requires admin)
