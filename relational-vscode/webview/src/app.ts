import 'reflect-metadata';

import { ContainerConfiguration } from '@eclipse-glsp/client';
import { GLSPStarter } from '@eclipse-glsp/vscode-integration-webview';

// @ts-ignore
import '@eclipse-glsp/vscode-integration-webview/css/glsp-vscode.css';
import { Container } from 'inversify';
import { initializeRelationalDiagramContainer } from '../../../relational-glsp-client';

class RelationalStarter extends GLSPStarter {
    createContainer(...containerConfiguration: ContainerConfiguration): Container {
        return initializeRelationalDiagramContainer(new Container() as any, ...containerConfiguration);
    }
}

new RelationalStarter();
