# Legal Semantic Search Application

A cutting-edge **AI Legal Semantic Search App** built using **PineconeDB**, **VoyageAI**, **LangChain**, and **Next.js**. This project demonstrates how to perform semantic searches over a legal document database efficiently, making it particularly useful for law students, lawyers, and researchers.

## Features

- **Semantic Search**: Uses AI-powered embeddings for natural language search across legal documents.
- **Vector Database**: Integrates PineconeDB to store and query vector embeddings.
- **Scalable Workflow**: Designed to handle metadata and optimize search relevance.
- **Optimized Indexing**: Processes, embeds, and indexes legal documents for fast retrieval.
- **Interactive Interface**: Built with Next.js to allow seamless search and interaction.

## Tech Stack

- **Frontend**: Next.js for building the user interface.
- **Backend**: API endpoints using Next.js server-side functions.
- **Database**: PineconeDB for vector storage and queries.
- **AI Tools**: VoyageAI for embeddings and LangChain for data transformation.

## Project Structure

```java
java
Copy code
├── app
│   ├── api
│   │   ├── bootstrap
│   │   ├── ingest
│   │   └── search
│   ├── components
│   ├── services
│   ├── types
│   ├── utils
│   └── pages
├── docs
│   └── Legal Documents (.pdf)
├── public
│   └── Static Assets
├── styles
└── package.json

```

## Getting Started

### Prerequisites

- **Node.js**: Ensure Node.js is installed.
- **Pinecone API Key**: Obtain an API key from [Pinecone Console](https://www.pinecone.io/).
- **VoyageAI API Key**: Create an account and generate an API key from the [VoyageAI Dashboard](https://www.voyage.ai/).

### Installation

1. Clone the repository:
    
    ```bash
    bash
    Copy code
    git clone https://github.com/yourusername/legal-semantic-search.git
    cd legal-semantic-search
    
    ```
    
2. Install dependencies:
    
    ```bash
    bash
    Copy code
    npm install
    
    ```
    
3. Set up environment variables:
    - Create a `.env.local` file in the root directory.
    - Add the following variables:
        
        ```
        PINECONE_API_KEY=you_pinecon_api_key
        VOYAGE_API_KEY=you_voyage_api_key
        PINECONE_INDEX=you_pinecone_index
        PORT='3000'
        
        ```
        
4. Prepare the data:
    - Place legal document PDFs in the `docs` directory.
    - Define metadata for each document in a `db.json` file.

### Running the Application

1. Start the development server:
    
    ```bash
    npm run dev
    
    ```
    
2. Visit the app at `http://localhost:3000`.
3. Search for legal cases using natural language.

### Deployment

To deploy the app to production:

1. Configure your `.env` file for the production environment.
2. Deploy to a platform like Vercel:
    
    ```bash
    npm run build
    npm run start
    
    ```
    

## How It Works

### Workflow

1. **Document Embedding**: Documents are processed into vector embeddings.
2. **Index Creation**: Vectors are stored in PineconeDB with metadata.
3. **Search Optimization**: Queries are filtered and re-ranked using VoyageAI.
4. **Interactive Search**: Users perform searches via a Next.js-powered interface.

### Example Use Cases

- Search for cases involving specific legal topics or parties.
- Retrieve precedents based on metadata such as date, defendant, or outcome.

## Future Improvements

- Expand the knowledge base to include more legal documents.
- Add multi-language support for global accessibility.
- Enhance UI/UX for better user interaction.

## Contributing

We welcome contributions to enhance this project! Feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.