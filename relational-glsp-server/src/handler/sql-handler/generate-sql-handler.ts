import { Action, ActionHandler, MaybePromise, MessageAction, SOURCE_URI_ARG } from '@eclipse-glsp/server';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RelationalModel } from '../../model/model';
import { RelationalModelState } from '../../model/model-state';
import { SQLGenerator } from '../generator/sql-generator';

export interface GenerateSqlAction extends Action {
    kind: typeof GenerateSqlAction.KIND;
}

export namespace GenerateSqlAction {
    export const KIND = 'generateSqlAction';
    export function create(): GenerateSqlAction {
        return { kind: KIND };
    }
}

@injectable()
export class GenerateSqlActionHandler implements ActionHandler {
    readonly actionKinds = [GenerateSqlAction.KIND];

    @inject(SQLGenerator) protected sqlGenerator: SQLGenerator;
    @inject(RelationalModelState) protected modelState: RelationalModelState; 

    execute(action: GenerateSqlAction): MaybePromise<Action[]> {
        const sourceModel = this.modelState.sourceModel as RelationalModel;
        console.log("Validación correcta. Generando SQL desde el modelo semántico...");
        
        const modelUri = this.modelState.get(SOURCE_URI_ARG) as string | undefined;
        if (!modelUri) {
            return [MessageAction.create('No se pudo determinar la ruta del modelo.', { severity: 'ERROR' })];
        }
        const sql = this.sqlGenerator.generate(sourceModel);

        try {
            const modelPath = modelUri.startsWith('file://') ? fileURLToPath(modelUri) : modelUri;
            const modelDir = path.dirname(modelPath);
            const baseName = path.basename(modelPath, path.extname(modelPath));
            const filePath = path.join(modelDir, `${baseName}.sql`);
            fs.writeFileSync(filePath, sql, 'utf-8');
            return [MessageAction.create(
                `SQL generado correctamente en: ${path.basename(filePath)}`,
                { severity: 'INFO' }
            )];
        } catch (err) {
            return [MessageAction.create(`Error al guardar el archivo SQL: ${err}`, { severity: 'ERROR' })];
        }
    }
}