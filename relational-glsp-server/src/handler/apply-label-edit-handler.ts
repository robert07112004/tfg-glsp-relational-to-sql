import { ApplyLabelEditOperation } from '@eclipse-glsp/protocol';
import { Command, GEdge, GLSPServerError, GNode, JsonOperationHandler, MaybePromise, toTypeGuard } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { Attribute, ReferentialAction } from '../model/model';
import { RelationalModelState } from '../model/model-state';

@injectable()
export class RelationalApplyLabelEditHandler extends JsonOperationHandler {
    readonly operationType = ApplyLabelEditOperation.KIND;

    @inject(RelationalModelState)
    protected override readonly modelState: RelationalModelState;

    override createCommand(operation: ApplyLabelEditOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const index = this.modelState.index;
            const parentNode = index.findParentElement(operation.labelId, toTypeGuard(GNode));
            if (parentNode) {
                if (parentNode.type === 'node:relation') {
                    const relation = index.findRelation(parentNode.id);
                    if (!relation) throw new GLSPServerError(`Relation not found: ${parentNode.id}`);
                    relation.name = operation.text;
                    return;
                }
                if (parentNode.type === 'node:attribute') {
                    const attribute = index.findAttribute(parentNode.id);
                    if (!attribute) throw new GLSPServerError(`Attribute not found: ${parentNode.id}`);

                    try {
                        const parsed       = Attribute.parseDisplayText(operation.text);
                        attribute.name     = parsed.name;
                        attribute.dataType = parsed.dataType;
                        attribute.isFK     = parsed.isFK;
                        attribute.isNN     = parsed.isNN;
                    } catch (msg) {
                        throw new GLSPServerError(String(msg));
                    }
                    return;
                }
            }

            const parentEdge = index.findParentElement(operation.labelId, toTypeGuard(GEdge));
            if (parentEdge) {
                const transition = index.findTransition(parentEdge.id);
                if (!transition) throw new GLSPServerError(`Transition not found: ${parentEdge.id}`);
                
                if (operation.labelId.endsWith('_actions')) {
                    const match = operation.text.trim().match(/^u:([cnrd])\s+d:([cnrd])$/i);
                    if (!match) throw new GLSPServerError(`Formato inválido. Usa "u:c d:n"`);
                    
                    transition.onUpdate = match[1].toLowerCase() as ReferentialAction;
                    transition.onDelete = match[2].toLowerCase() as ReferentialAction;
                }
                return;
            }

            throw new GLSPServerError(`No parent found for label: ${operation.labelId}`);
        });
    }
}