import { GModelElement } from '@eclipse-glsp/server';
import { injectable } from 'inversify';

@injectable()
export class SQLGenerator {
    
    // Método principal que recibe todas las relaciones (tablas) del diagrama
    public generate(root: GModelElement): string {
        let sqlScript = '-- ==========================================\n';
        sqlScript += '-- Script SQL generado automáticamente por GLSP\n';
        sqlScript += '-- ==========================================\n\n';

        return sqlScript;
    }
}