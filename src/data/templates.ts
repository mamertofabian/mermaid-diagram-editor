export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  icon: string;
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: 'flowchart-basic',
    name: 'Basic Flowchart',
    description: 'Simple decision flow with start, decision, and end nodes',
    category: 'Flowchart',
    icon: '🔄',
    code: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Fix it]
    D --> B
    C --> E[End]
    
    style A fill:#e1f5fe
    style E fill:#c8e6c9
    style B fill:#fff3e0`
  },
  {
    id: 'sequence-basic',
    name: 'User Login Sequence',
    description: 'User authentication flow sequence diagram',
    category: 'Sequence',
    icon: '👤',
    code: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    
    U->>+F: Enter credentials
    F->>+B: POST /login
    B->>+D: Validate user
    D-->>-B: User data
    B-->>-F: Auth token
    F-->>-U: Login success`
  },
  {
    id: 'class-basic',
    name: 'Class Diagram',
    description: 'Object-oriented design with inheritance',
    category: 'Class',
    icon: '🏗️',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +move()
    }
    
    class Dog {
        +String breed
        +bark()
        +fetch()
    }
    
    class Cat {
        +bool indoor
        +meow()
        +purr()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`
  },
  {
    id: 'state-basic',
    name: 'State Machine',
    description: 'State transitions for a simple process',
    category: 'State',
    icon: '⚡',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Success : complete
    Processing --> Error : fail
    Success --> [*]
    Error --> Idle : retry
    Error --> [*] : abort`
  },
  {
    id: 'gitgraph-basic',
    name: 'Git Branching Flow',
    description: 'Git workflow with feature branches',
    category: 'Git',
    icon: '🌿',
    code: `gitGraph
    commit id: "Initial"
    branch feature
    checkout feature
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    commit id: "Hotfix"
    checkout feature
    commit id: "Feature C"
    checkout main
    merge feature
    commit id: "Release"`
  },
  {
    id: 'er-basic',
    name: 'Entity Relationship',
    description: 'Database schema with relationships',
    category: 'Database',
    icon: '🗃️',
    code: `erDiagram
    CUSTOMER {
        string customer_id PK
        string name
        string email
        string phone
    }
    
    ORDER {
        string order_id PK
        string customer_id FK
        date order_date
        decimal total
    }
    
    PRODUCT {
        string product_id PK
        string name
        decimal price
        int stock
    }
    
    ORDER_ITEM {
        string order_id FK
        string product_id FK
        int quantity
        decimal price
    }
    
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"`
  },
  {
    id: 'gantt-basic',
    name: 'Project Timeline',
    description: 'Project management timeline with tasks',
    category: 'Project',
    icon: '📊',
    code: `gantt
    title Project Development Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design         :a2, after a1, 5d
    section Development
    Frontend       :b1, after a2, 14d
    Backend        :b2, after a2, 10d
    Testing        :b3, after b1, 7d
    section Launch
    Deployment     :c1, after b3, 3d
    Go Live        :c2, after c1, 1d`
  },
  {
    id: 'mindmap-basic',
    name: 'Mind Map',
    description: 'Brainstorming and idea organization',
    category: 'Planning',
    icon: '🧠',
    code: `mindmap
  root((Project Planning))
    Requirements
      Functional
        User Authentication
        Data Management
        Reporting
      Non-Functional
        Performance
        Security
        Scalability
    Design
      UI/UX
        Wireframes
        Mockups
      Architecture
        Frontend
        Backend
        Database
    Development
      Sprint 1
      Sprint 2
      Sprint 3`
  }
];

export const TEMPLATE_CATEGORIES = Array.from(
  new Set(DIAGRAM_TEMPLATES.map(template => template.category))
);

export function getTemplatesByCategory(category: string): DiagramTemplate[] {
  return DIAGRAM_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): DiagramTemplate | undefined {
  return DIAGRAM_TEMPLATES.find(template => template.id === id);
}