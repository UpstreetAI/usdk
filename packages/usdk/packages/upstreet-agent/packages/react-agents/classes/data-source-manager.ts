interface DataSource {
  id: string;
  type: string;
  fetch(): Promise<any>;
}

export class DataSourceManager {
  private dataSources: Map<string, DataSource>;

  constructor() {
    this.dataSources = new Map();
  }

  addDataSource(dataSource: DataSource): void {
    this.dataSources.set(dataSource.id, dataSource);
  }

  removeDataSource(id: string): boolean {
    return this.dataSources.delete(id);
  }

  async fetchAllData(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const [id, source] of this.dataSources) {
      try {
        results[id] = await source.fetch();
      } catch (error) {
        console.error(`Error fetching data from source ${id}:`, error);
      }
    }

    return results;
  }

  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.get(id);
  }

  getAllDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }
}

