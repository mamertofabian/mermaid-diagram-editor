import { type Diagram } from '../services/DiagramStorage';

export const WELCOME_DIAGRAM: Diagram = {
  id: 'welcome',
  name: '🎉 Welcome to Mermaid Diagram Editor',
  code: `flowchart TD
    Start([🚀 Welcome to Mermaid Editor]) --> Features[✨ Key Features]
    
    Features --> Import[📁 Import & Export]
    Features --> Share[🔗 Share Diagrams]
    Features --> Editor[✏️ Live Editor]
    Features --> Export[💾 Export Options]
    
    Import --> ImportFiles["📄 Drag & drop .mmd/.json files<br/>🔄 Import button for file selection<br/>📋 Export all diagrams as backup"]
    
    Share --> ShareOptions["🔗 Generate shareable URLs<br/>📋 Copy links to clipboard<br/>🌐 Open shared diagrams instantly"]
    
    Editor --> EditorFeatures["👁️ Live preview mode<br/>📝 Code editor with syntax<br/>🎨 Light/dark themes<br/>🔍 Zoom & pan controls<br/>📱 Mobile 2-row layout<br/>✨ Smooth animations"]
    
    Export --> ExportFormats["📄 PDF export<br/>🖼️ PNG/SVG images<br/>🖨️ Print support<br/>📁 .mmd file format<br/>📱 Mobile export buttons"]
    
    Features --> GetStarted[🎯 Get Started]
    GetStarted --> NewDiagram["➕ Click 'New Diagram' to create<br/>📝 Write Mermaid syntax in editor<br/>👁️ Toggle preview/code view"]
    
    GetStarted --> Tips[💡 Tips]
    Tips --> TipsList["🖱️ Right-click to pan anytime<br/>⚡ Auto-save keeps your work safe<br/>📱 Works on all devices<br/>🎮 Use keyboard arrows to navigate<br/>✨ Smooth sidebar animations<br/>🔧 Mobile 2-row controls"]
    
    style Start fill:#4F46E5,stroke:#1E40AF,stroke-width:3px,color:#fff
    style Features fill:#7C3AED,stroke:#5B21B6,stroke-width:2px,color:#fff
    style GetStarted fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
    style Tips fill:#DC2626,stroke:#B91C1C,stroke-width:2px,color:#fff`,
  theme: 'dark' as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const TUTORIAL_DIAGRAM: Diagram = {
  id: 'tutorial',
  name: '📚 Mermaid Syntax Tutorial',
  code: `flowchart TD
    %% Main Entry Point
    Start([🎯 Mermaid Mastery Guide])
    Choice{What's your goal?}
    Start --> Choice
    
    %% Learning Paths
    Learn[📚 Learn Syntax]
    Quick[⚡ Quick Reference]
    Practice[🏗️ Build Something]
    Choice --> Learn
    Choice --> Quick
    Choice --> Practice
    
    %% Quick Reference Branch
    RefCard[📋 Cheat Sheet]
    Quick --> RefCard
    
    %% Actual Syntax Reference
    subgraph QuickSyntax [⚡ Quick Syntax Reference]
        QS1["🔷 Node Shapes:<br/>A[Rectangle] B(Rounded)<br/>C{Diamond} D((Circle))<br/>E{{Hexagon}} F([Stadium])"]
        QS2["➡️ Arrow Types:<br/>A --> B (solid)<br/>A -.-> B (dotted)<br/>A ==> B (thick)<br/>A -->|label| B (with text)"]
        QS3["🎨 Basic Styling:<br/>style A fill:#f9f,stroke:#333<br/>classDef myClass fill:#bbf<br/>class A myClass"]
        
        QS1 --> QS2
        QS2 --> QS3
    end
    
    RefCard --> QuickSyntax
    
    %% Learning Path - Organized by Difficulty
    Beginner[🟢 Beginner Level]
    Intermediate[🟡 Intermediate Level] 
    Advanced[🔴 Advanced Level]
    Learn --> Beginner
    Learn --> Intermediate
    Learn --> Advanced
    
    %% Beginner Level - Flowcharts
    FlowBasic[📊 Basic Flowcharts]
    Beginner --> FlowBasic
    
    subgraph FlowSyntax [📝 Flowchart Syntax]
        FS1["flowchart TD<br/>    🚀 Start[Begin Process]<br/>    📋 Decision{Is Valid?}<br/>    ✅ Process[Do Something]<br/>    ❌ Error[Show Error]<br/>    🏁 End[Finish]<br/><br/>    🚀 Start --> 📋 Decision<br/>    📋 Decision -->|Yes| ✅ Process<br/>    📋 Decision -->|No| ❌ Error<br/>    ✅ Process --> 🏁 End<br/>    ❌ Error --> 🏁 End"]
    end
    
    FlowBasic --> FlowSyntax
    
    %% Live Flowchart Example
    subgraph FlowExample [🎨 Live Example]
        FE_Start[🚀 Begin Process]
        FE_Check{📋 Is Valid?}
        FE_Process[✅ Do Something] 
        FE_Error[❌ Show Error]
        FE_End[🏁 Finish]
        
        FE_Start --> FE_Check
        FE_Check -->|Yes| FE_Process
        FE_Check -->|No| FE_Error
        FE_Process --> FE_End
        FE_Error --> FE_End
    end
    
    FlowSyntax --> FlowExample
    
    FlowUses[🎯 Perfect for:<br/>• Process flows<br/>• Decision trees<br/>• Algorithms<br/>• Workflows]
    FlowBasic --> FlowUses
    
    %% Intermediate Level - Sequence Diagrams
    SeqDiagram[👥 Sequence Diagrams]
    Intermediate --> SeqDiagram
    
    subgraph SeqSyntax [📝 Sequence Syntax]
        SS1["sequenceDiagram<br/>    participant U as 👤 User<br/>    participant A as 💻 API<br/>    participant D as 🗄️ Database<br/>    participant R as 📨 Response<br/><br/>    U->>A: Send Request<br/>    A->>D: Query Database<br/>    D-->>A: Return Data<br/>    A-->>R: Process Response<br/>    R-->>U: Show Result"]
    end
    
    SeqDiagram --> SeqSyntax
    
    subgraph SeqExample [🎨 Live Sequence Flow]
        SE_User[👤 User]
        SE_API[💻 API]
        SE_DB[🗄️ Database]
        SE_Response[📨 Response]
        
        SE_User --> SE_API
        SE_API --> SE_DB
        SE_DB --> SE_API  
        SE_API --> SE_Response
        SE_Response --> SE_User
    end
    
    SeqSyntax --> SeqExample
    
    %% Class Diagrams
    ClassDiagram[🏗️ Class Diagrams]
    Intermediate --> ClassDiagram
    
    subgraph ClassSyntax [📝 Class Syntax]
        CS1["classDiagram<br/>    class 🐾 Animal {<br/>        +String name<br/>        +int age<br/>        +makeSound()<br/>        +move()<br/>    }<br/>    class 🐕 Dog {<br/>        +String breed<br/>        +bark()<br/>    }<br/>    class 🐱 Cat {<br/>        +bool indoor<br/>        +meow()<br/>    }<br/><br/>    🐾 Animal --> 🐕 Dog<br/>    🐾 Animal --> 🐱 Cat"]
    end
    
    ClassDiagram --> ClassSyntax
    
    subgraph ClassExample [🎨 Live Class Example]
        CE_Animal["🐾 Animal<br/>────<br/>+ name: String<br/>+ age: int<br/>────<br/>+ makeSound()<br/>+ move()"]
        CE_Dog["🐕 Dog<br/>────<br/>+ breed: String<br/>────<br/>+ bark()"]
        CE_Cat["🐱 Cat<br/>────<br/>+ indoor: bool<br/>────<br/>+ meow()"]
        
        CE_Animal --> CE_Dog
        CE_Animal --> CE_Cat
    end
    
    ClassSyntax --> ClassExample
    
    %% Advanced Level - State Diagrams
    StateDiagram[⚡ State Diagrams]
    Advanced --> StateDiagram
    
    subgraph StateSyntax [📝 State Syntax]
        STS1["stateDiagram-v2<br/>    [*] --> 🟡 Idle<br/>    🟡 Idle --> 🔄 Loading : start<br/>    🔄 Loading --> 🟢 Active : success<br/>    🔄 Loading --> 🔴 Error : failure<br/>    🟢 Active --> 🟡 Idle : reset<br/>    🔴 Error --> 🟡 Idle : retry<br/>    🟢 Active --> [*] : complete"]
    end
    
    StateDiagram --> StateSyntax
    
    subgraph StateExample [🎨 Live State Example]
        STE_Idle[🟡 Idle]
        STE_Loading[🔄 Loading]
        STE_Active[🟢 Active] 
        STE_Error[🔴 Error]
        
        STE_Idle -->|start| STE_Loading
        STE_Loading -->|success| STE_Active
        STE_Loading -->|failure| STE_Error
        STE_Active -->|reset| STE_Idle
        STE_Error -->|retry| STE_Idle
        STE_Active -->|complete| STE_End[🏁 End]
    end
    
    StateSyntax --> StateExample
    
    %% Entity Relationship Diagrams
    ERDiagram[🗃️ Entity Relationship]
    Advanced --> ERDiagram
    
    subgraph ERSyntax [📝 ER Syntax]
        ERS1["erDiagram<br/>    👤 USER {<br/>        🔑 int id PK<br/>        📧 string email<br/>        👤 string name<br/>    }<br/>    📦 ORDER {<br/>        🔑 int id PK<br/>        🔗 int user_id FK<br/>        💰 decimal total<br/>    }<br/>    📋 PRODUCT {<br/>        🔑 int id PK<br/>        📝 string name<br/>        💵 decimal price<br/>    }<br/><br/>    👤 USER --> 📦 ORDER<br/>    📦 ORDER --> 📋 PRODUCT"]
    end
    
    ERDiagram --> ERSyntax
    
    subgraph ERExample [🎨 Live ER Example]
        ERE_User["👤 USER<br/>═══════<br/>🔑 id (PK)<br/>📧 email<br/>👤 name"]
        ERE_Order["📦 ORDER<br/>═══════<br/>🔑 id (PK)<br/>🔗 user_id (FK)<br/>💰 total"]
        ERE_Product["📋 PRODUCT<br/>═══════<br/>🔑 id (PK)<br/>📝 name<br/>💵 price"]
        
        ERE_User --> ERE_Order
        ERE_Order --> ERE_Product
    end
    
    ERSyntax --> ERExample
    
    %% Git Graph
    GitGraph[🌿 Git Workflows]
    Advanced --> GitGraph
    
    subgraph GitSyntax [📝 Git Syntax]
        GS1["gitGraph<br/>    commit id: '🚀 Initial'<br/>    commit id: '✨ Feature'<br/>    branch develop<br/>    checkout develop<br/>    commit id: '🔧 Develop'<br/>    commit id: '🔀 Merge'<br/>    checkout main<br/>    merge develop<br/>    commit id: '🚀 Release'"]
    end
    
    GitGraph --> GitSyntax
    
    subgraph GitExample [🎨 Live Git Example]
        GE_Initial((🚀 Initial))
        GE_Feature((✨ Feature))
        GE_Develop((🔧 Develop))
        GE_Merge((🔀 Merge))
        GE_Release((🚀 Release))
        
        GE_Initial --> GE_Feature
        GE_Feature --> GE_Develop
        GE_Feature --> GE_Merge
        GE_Develop --> GE_Merge
        GE_Merge --> GE_Release
    end
    
    GitSyntax --> GitExample
    
    %% Practice Section
    Templates[📋 Ready Templates]
    Practice --> Templates
    
    subgraph PracticeExamples [🏗️ Copy & Use These Examples]
        PE1["🌐 Simple Website Flow:<br/>flowchart TD<br/>    🏠 A[Home Page] --> 🔐 B{User Login?}<br/>    🔐 B -->|Yes| 📊 C[Dashboard]<br/>    🔐 B -->|No| 🔑 D[Login Page]<br/>    🔑 D --> ✅ E[Authenticate]<br/>    ✅ E --> 📊 C"]
        
        PE2["📊 API Call Flow:<br/>sequenceDiagram<br/>    participant C as 💻 Client<br/>    participant A as 🔌 API<br/>    participant D as 🗄️ Database<br/>    💻 C->>🔌 A: POST /users<br/>    🔌 A->>🗄️ D: INSERT user<br/>    🗄️ D-->>🔌 A: Success<br/>    🔌 A-->>💻 C: 201 Created"]
        
        PE3["🏗️ Simple Class:<br/>classDiagram<br/>    class 👤 User {<br/>        +string email<br/>        +string password<br/>        +login()<br/>        +logout()<br/>    }"]
    end
    
    Templates --> PracticeExamples
    
    %% Pro Tips
    subgraph ProTips [💪 Pro Tips & Best Practices]
        PT1[🎨 Styling Tips:<br/>Apply styles at the end<br/>Use classDef for reusability<br/>Keep colors consistent]
        
        PT2[🔧 Syntax Tips:<br/>Use quotes for spaces<br/>Test incrementally<br/>Keep nodes short<br/>Use meaningful IDs]
        
        PT3[📱 Layout Tips:<br/>Choose right direction<br/>Use subgraphs for grouping<br/>Limit connections per node<br/>Consider mobile view]
        
        PT1 --> PT2
        PT2 --> PT3
    end
    
    subgraph Troubleshooting [🛠️ Common Issues & Solutions]
        TS1["❌ Parse Errors:<br/>• Check for unmatched brackets<br/>• Ensure proper quotes<br/>• Verify arrow syntax<br/>• Check for reserved words"]
        
        TS2["🔀 Layout Issues:<br/>• Use direction: TD/LR<br/>• Group with subgraphs<br/>• Limit node connections<br/>• Try different arrow types"]
        
        TS3["🎨 Styling Problems:<br/>• Move styles to end<br/>• Check CSS syntax<br/>• Use proper color codes<br/>• Test one style at a time"]
        
        TS1 --> TS2
        TS2 --> TS3
    end
    
    %% Connect sections
    Learn --> ProTips
    Quick --> Troubleshooting
    Practice --> ProTips
    
    %% Connect examples to practice
    FlowExample --> Practice
    SeqExample --> Practice
    ClassExample --> Practice
    StateExample --> Practice
    ERExample --> Practice
    GitExample --> Practice
    
    %% Styling
    style Start fill:#6366f1,stroke:#4338ca,stroke-width:3px,color:#fff
    style Choice fill:#8b5cf6,stroke:#7c3aed,stroke-width:3px,color:#fff
    style Learn fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style Quick fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    style Practice fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    
    style Beginner fill:#22c55e,stroke:#16a34a,stroke-width:2px,color:#fff
    style Intermediate fill:#eab308,stroke:#ca8a04,stroke-width:2px,color:#000
    style Advanced fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    
    style QuickSyntax fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px
    style FlowSyntax fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px
    style SeqSyntax fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style ClassSyntax fill:#ecfdf5,stroke:#10b981,stroke-width:2px
    style StateSyntax fill:#fdf4ff,stroke:#a855f7,stroke-width:2px
    style ERSyntax fill:#fef2f2,stroke:#ef4444,stroke-width:2px
    style GitSyntax fill:#e0f2fe,stroke:#0284c7,stroke-width:2px
    
    style FlowExample fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px
    style SeqExample fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style ClassExample fill:#ecfdf5,stroke:#10b981,stroke-width:2px
    style StateExample fill:#fdf4ff,stroke:#a855f7,stroke-width:2px
    style ERExample fill:#fef2f2,stroke:#ef4444,stroke-width:2px
    style GitExample fill:#e0f2fe,stroke:#0284c7,stroke-width:2px
    
    style PracticeExamples fill:#f8fafc,stroke:#64748b,stroke-width:2px
    style ProTips fill:#f8fafc,stroke:#64748b,stroke-width:2px
    style Troubleshooting fill:#fef7f0,stroke:#f97316,stroke-width:2px`,
  theme: 'dark' as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};