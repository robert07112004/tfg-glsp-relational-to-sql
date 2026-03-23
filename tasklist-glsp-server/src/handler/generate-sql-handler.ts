import { Action, ActionHandler, MaybePromise } from '@eclipse-glsp/server';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { RelationalModel } from '../model/model';
import { RelationalModelState } from '../model/model-state';
import { SQLGenerator } from './generator/sql-generator';

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
        const sql = this.sqlGenerator.generate(sourceModel);

        try {
            const fileName = 'script_generado.sql';
            const projectRoot = path.resolve(__dirname, '../../../');
            const filePath = path.join(projectRoot, fileName);
            fs.writeFileSync(filePath, sql, 'utf-8');
            console.log("----------------------------------------------");
            console.log(`✅ Archivo SQL generado en la raíz del proyecto:`);
            console.log(filePath);
            console.log("----------------------------------------------");
        } catch (err) {
            console.error("❌ Error al guardar el archivo:", err);
        }

        return [];
    }
}