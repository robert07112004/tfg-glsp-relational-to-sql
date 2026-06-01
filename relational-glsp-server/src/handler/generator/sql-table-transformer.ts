import { Attribute, Relation, RelationalModel, Transition } from '../../model/model';
import { Column, ForeignKey, Table, toSQLAction } from './sql-interfaces';

export class SQLTableTransformer {

    static buildTableDefinition(relation: Relation, model: RelationalModel): Table {
        const attributes = relation.attributes ?? [];
        const columns: Column[] = attributes.map(attr => SQLTableTransformer.toColumn(attr));
        const foreignKeys: ForeignKey[] = attributes
            .filter(a => a.isFK)
            .map(fk => SQLTableTransformer.buildFKEntry(fk, model))
            .filter((fk): fk is ForeignKey => fk !== undefined);

        return { name: relation.name, columns, foreignKeys };
    }

    private static toColumn(attr: Attribute): Column {
        return {
            name:      attr.name,
            dataType:  attr.dataType,
            isPK:      attr.isPK,
            isUnique:  attr.isUN,
            isNotNull: attr.isNN,
            isFK:      attr.isFK
        };
    }

    private static buildFKEntry(fk: Attribute, model: RelationalModel): ForeignKey | undefined {
        const { columnName, tableName } = SQLTableTransformer.getTarget(fk, model);
        if (!tableName) return undefined;

        const edge = SQLTableTransformer.getEdge(fk, model);
        return {
            sourceColumn: fk.name,
            targetColumn: columnName,
            targetTable:  tableName,
            onDelete:     toSQLAction(edge?.onDelete),
            onUpdate:     toSQLAction(edge?.onUpdate)
        };
    }

    private static getEdge(fk: Attribute, model: RelationalModel): Transition | undefined {
        return model.transitions.find(t =>
            t.sourceId === `${fk.id}_port_right` ||
            t.sourceId === `${fk.id}_port_left`  ||
            t.sourceId === fk.id
        );
    }

    private static getTarget(fk: Attribute, model: RelationalModel): { columnName: string; tableName: string } {
        const edge = SQLTableTransformer.getEdge(fk, model);
        if (!edge) return { columnName: '', tableName: '' };

        const targetBaseId = edge.targetId.replace(/_port_(left|right)$/, '');
        const targetRelation = model.relations.find(r => r.id === targetBaseId);
        if (targetRelation) {
            const pk = targetRelation.attributes?.find(a => a.isPK);
            if (pk) return { columnName: pk.name, tableName: targetRelation.name };
        }

        for (const relation of model.relations) {
            const match = relation.attributes?.find(a => a.id === targetBaseId && (a.isPK || a.isUN));
            if (match) return { columnName: match.name, tableName: relation.name };
        }

        return { columnName: '', tableName: '' };
    }
}
