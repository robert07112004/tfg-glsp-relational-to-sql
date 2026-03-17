import { AbstractModelValidator, GModelElement, Marker } from '@eclipse-glsp/server';
import { injectable } from 'inversify';

@injectable()
export class RelationalModelValidator extends AbstractModelValidator {
    
    override doBatchValidation(element: GModelElement): Marker[] {
        
        return [];
    }
}