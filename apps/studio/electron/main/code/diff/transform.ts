import traverse, { type NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import { type CodeAction, CodeActionType } from '@analogia/models/actions';
import type { CodeDiffRequest } from '@analogia/models/code';
import { groupElementsInNode, ungroupElementsInNode } from './group';
import { getOidFromJsxElement } from './helpers';
import { insertImageToNode, removeImageFromNode } from './image';
import { insertElementToNode } from './insert';
import { moveElementInNode } from './move';
import { removeElementFromNode } from './remove';
import { addClassToNode, replaceNodeClasses, updateNodeProp } from './style';
import { updateNodeTextContent } from './text';
import { assertNever } from '/common/helpers';

export function transformAst(ast: t.File, oidToCodeDiff: Map<string, CodeDiffRequest>): void {
    traverse(ast, {
        JSXElement(path) {
            const currentOid = getOidFromJsxElement(path.node.openingElement);
            if (!currentOid) {
                console.error('No oid found for jsx element');
                return;
            }
            const codeDiffRequest = oidToCodeDiff.get(currentOid);
            if (codeDiffRequest) {
                const { attributes, textContent, structureChanges } = codeDiffRequest;

                if (attributes) {
                    Object.entries(attributes).forEach(([key, value]) => {
                        if (key === 'className') {
                            if (codeDiffRequest.overrideClasses) {
                                replaceNodeClasses(path.node, value as string);
                            } else {
                                addClassToNode(path.node, value as string);
                            }
                        } else {
                            updateNodeProp(path.node, key, value);
                        }
                    });
                }

                if (textContent !== undefined && textContent !== null) {
                    updateNodeTextContent(path.node, textContent);
                }

                applyStructureChanges(path, structureChanges);
            }
        },
    });
}

function applyStructureChanges(path: NodePath<t.JSXElement>, actions: CodeAction[]): void {
    if (actions.length === 0) {
        return;
    }
    for (const action of actions) {
        switch (action.type) {
            case CodeActionType.MOVE:
                moveElementInNode(path, action);
                break;
            case CodeActionType.INSERT:
                insertElementToNode(path, action);
                break;
            case CodeActionType.REMOVE:
                removeElementFromNode(path, action);
                break;
            case CodeActionType.GROUP:
                groupElementsInNode(path, action);
                break;
            case CodeActionType.UNGROUP:
                ungroupElementsInNode(path, action);
                break;
            case CodeActionType.INSERT_IMAGE:
                insertImageToNode(path, action);
                break;
            case CodeActionType.REMOVE_IMAGE:
                removeImageFromNode(path, action);
                break;
            default:
                assertNever(action);
        }
    }
}
