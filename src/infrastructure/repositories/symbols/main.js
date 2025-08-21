import { ISymbolRepository } from '../../../domain/repositories/ISymbolRepository.js';
import { Symbol } from '../../../domain/entities/Symbol.js';
import { Provider } from '../../../domain/value-objects/Provider.js';
import { selectSymbols, insertSymbol } from './sql.js';

export class PostgresSymbolRepository extends ISymbolRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async getSymbols() {
    const { query } = selectSymbols();
    const { rows } = await this._pool.query(query);
    return rows.map(row => new Symbol(row.symbol, row.exchange || row.provider));
  }

  async getSymbolsByProvider(provider) {
    const providerObj = new Provider(provider);
    const { query, params } = selectSymbols(providerObj.name);
    const { rows } = await this._pool.query(query, params);
    return rows.map(row => new Symbol(row.symbol, row.exchange || row.provider));
  }

  async symbolExists(symbol, provider) {
    const providerObj = new Provider(provider);
    const symbols = await this.getSymbolsByProvider(providerObj.name);
    return symbols.some(s => s.symbol === symbol);
  }

  async addSymbol(symbol) {
    if (!(symbol instanceof Symbol)) {
      throw new Error('Symbol must be an instance of Symbol entity');
    }
    
    const { query, params } = insertSymbol(symbol.symbol, symbol.exchange);
    try {
      await this._pool.query(query, params);
    } catch (err) {
      if (err.code === '23505') {
        return;
      }
      throw err;
    }
  }

  async removeSymbol(symbol, provider) {
    const providerObj = new Provider(provider);
    const query = 'DELETE FROM symbols WHERE symbol = $1 AND (exchange = $2 OR provider = $2)';
    await this._pool.query(query, [symbol, providerObj.name]);
  }
}

export const init = (pool) => {
  return new PostgresSymbolRepository(pool);
};
