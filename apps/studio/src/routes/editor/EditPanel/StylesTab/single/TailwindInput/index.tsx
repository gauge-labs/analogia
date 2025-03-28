import { useEditorEngine } from '@/components/Context';
import { StyleMode } from '@/lib/editor/engine/style';
import { invokeMainChannel, sendAnalytics } from '@/lib/utils';
import type { CodeDiffRequest } from '@analogia/models/code';
import { MainChannels } from '@analogia/models/constants';
import type { ClassParsingResult, DomElement } from '@analogia/models/element';
import { Button } from '@analogia/ui/button';
import { Icons } from '@analogia/ui/icons';
import { Textarea } from '@analogia/ui/textarea';
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from '@analogia/ui/tooltip';
import { cn } from '@analogia/ui/utils';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { AutoComplete, type SuggestionsListRef } from './AutoComplete';

interface History {
    past: string[];
    present: string;
    future: string[];
    error?: string;
}

const TailwindInput = observer(() => {
    const editorEngine = useEditorEngine();
    const suggestionRef = useRef<SuggestionsListRef>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [selectedEl, setSelectedEl] = useState<DomElement | undefined>();
    let resizeObserver: ResizeObserver | undefined;

    const instanceRef = useRef<HTMLTextAreaElement>(null);
    const [instanceHistory, setInstanceHistory] = useState<History>({
        past: [],
        present: '',
        future: [],
    });
    const [isInstanceFocused, setIsInstanceFocused] = useState(false);

    const rootRef = useRef<HTMLTextAreaElement>(null);
    const [rootHistory, setRootHistory] = useState<History>({
        past: [],
        present: '',
        future: [],
    });
    const [isRootFocused, setIsRootFocused] = useState(false);

    const updateHistory = (
        value: string,
        { past, present }: History,
        setHistory: React.Dispatch<React.SetStateAction<History>>,
    ) => {
        setHistory({
            past: [...past, present],
            present: value,
            future: [],
        });
    };

    const didChangeFromOriginal = (history: History, value: string) => {
        if (history.past.length === 0) {
            return false;
        }
        return history.past[0] !== value;
    };

    const undo = (history: History, setHistory: React.Dispatch<React.SetStateAction<History>>) => {
        const { past, present, future } = history;
        if (past.length === 0) {
            return;
        }

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setHistory({
            past: newPast,
            present: previous,
            future: [present, ...future],
        });
    };

    const redo = (history: History, setHistory: React.Dispatch<React.SetStateAction<History>>) => {
        const { past, present, future } = history;
        if (future.length === 0) {
            return;
        }

        const next = future[0];
        const newFuture = future.slice(1);

        setHistory({
            past: [...past, present],
            present: next,
            future: newFuture,
        });
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
        history: History,
        setHistory: React.Dispatch<React.SetStateAction<History>>,
    ) => {
        if (showSuggestions) {
            suggestionRef.current?.handleKeyDown(e);
            return;
        }

        if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
            e.currentTarget.blur();
            e.preventDefault();
            return;
        }

        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                redo(history, setHistory);
            } else {
                undo(history, setHistory);
            }
        }
    };

    useEffect(() => {
        if (editorEngine.elements.selected.length > 0) {
            const selectedEl = editorEngine.elements.selected[0];
            setSelectedEl(selectedEl);
            if (!isInstanceFocused) {
                getInstanceClasses(selectedEl);
            }
            if (!isRootFocused) {
                getRootClasses(selectedEl);
            }
        } else {
            setSelectedEl(undefined);
            setInstanceHistory({ past: [], present: '', future: [] });
            setRootHistory({ past: [], present: '', future: [] });
        }
    }, [
        editorEngine.elements.selected,
        editorEngine.ast.mappings.layers,
        editorEngine.history.length,
    ]);

    async function getInstanceClasses(domEl: DomElement) {
        const newInstance = await editorEngine.ast.getTemplateNodeById(domEl.instanceId);

        if (newInstance) {
            const instanceClasses: ClassParsingResult = await invokeMainChannel(
                MainChannels.GET_TEMPLATE_NODE_CLASS,
                newInstance,
            );

            if (instanceClasses.type === 'error') {
                console.warn(instanceClasses.reason);
            }

            setInstanceHistory({
                past: [],
                present:
                    instanceClasses.type === 'classes'
                        ? instanceClasses.value.join(' ')
                        : instanceClasses.type,
                future: [],
                error: instanceClasses.type === 'error' ? instanceClasses.reason : undefined,
            });
        }
    }

    async function getRootClasses(domEl: DomElement) {
        const newRoot = await editorEngine.ast.getTemplateNodeById(domEl.oid);
        if (newRoot) {
            const rootClasses: ClassParsingResult = await invokeMainChannel(
                MainChannels.GET_TEMPLATE_NODE_CLASS,
                newRoot,
            );

            if (rootClasses.type === 'error') {
                console.warn(rootClasses.reason);
            }

            setRootHistory({
                past: [],
                present:
                    rootClasses.type === 'classes' ? rootClasses.value.join(' ') : rootClasses.type,
                future: [],
                error: rootClasses.type === 'error' ? rootClasses.reason : undefined,
            });
        }
    }

    async function getPrevRootClasses(domEl: DomElement): Promise<string[]> {
        try {
            const newRoot = await editorEngine.ast.getTemplateNodeById(domEl.oid);
            if (newRoot) {
                const rootClasses: ClassParsingResult = await invokeMainChannel(
                    MainChannels.GET_TEMPLATE_NODE_CLASS,
                    newRoot,
                );

                if (rootClasses.type === 'error') {
                    console.warn(rootClasses.reason);
                }

                return rootClasses.type === 'classes' ? rootClasses.value : [];
            }
            return [];
        } catch (err) {
            console.log('erpr ', err);
            return [];
        }
    }

    const createCodeDiffRequest = async (oid: string | undefined, className: string) => {
        if (!oid) {
            console.error('No oid found for createCodeDiffRequest');
            return;
        }
        const templateNode = await editorEngine.ast.getTemplateNodeById(oid);
        if (!templateNode) {
            console.error('No templateNode found for createCodeDiffRequest');
            return;
        }

        const request: CodeDiffRequest[] = [];
        const selectedElements = editorEngine.elements.selected;
        const selectedElprevClasses = await getPrevRootClasses(selectedElements[0]);
        const computedClass = compareClassNames(selectedElprevClasses, className.split(' '));

        for (const ele of selectedElements) {
            let computedClassName: string = '';
            const isNonSelectedElement = ele.oid !== oid;

            if (isNonSelectedElement) {
                const prevClasses = await getPrevRootClasses(ele);
                computedClassName = computeClassForNonSelectedElement(
                    computedClass.added,
                    computedClass.removed,
                    prevClasses,
                );
            } else {
                computedClassName = className;
            }

            request.push({
                oid: ele.oid || '',
                attributes: { className: computedClassName },
                textContent: null,
                overrideClasses: true,
                structureChanges: [],
            });
        }

        const res = await editorEngine.code.getAndWriteCodeDiff(request, true);
        if (res) {
            sendAnalytics('tailwind action');
        }
    };

    function computeClassForNonSelectedElement(
        addedClasses: string[],
        removedClasses: string[],
        originalClasses: string[],
    ): string {
        const finalClasses: string[] = [...originalClasses];
        let classRemoved: boolean = false;

        if (removedClasses.length > 0) {
            removedClasses.forEach((cls) => {
                const index = finalClasses.indexOf(cls);
                if (index !== -1) {
                    finalClasses.splice(index, 1);
                    classRemoved = true;
                }
            });
        }

        if (removedClasses.length > 0 && classRemoved) {
            addedClasses.forEach((cls) => {
                if (!finalClasses.includes(cls)) {
                    finalClasses.push(cls);
                }
            });
        } else {
            if (removedClasses.length === 0) {
                addedClasses.forEach((cls) => {
                    if (!finalClasses.includes(cls)) {
                        finalClasses.push(cls);
                    }
                });
            }
        }

        return finalClasses.join(' ');
    }

    function compareClassNames(
        oldClasses: string[],
        newClasses: string[],
    ): {
        added: string[];
        removed: string[];
    } {
        const addedClasses = newClasses.filter((cls) => !oldClasses.includes(cls));

        const removedClasses = oldClasses.filter((cls) => !newClasses.includes(cls));

        return {
            added: addedClasses,
            removed: removedClasses,
        };
    }

    const handleInput = (
        e: React.FormEvent<HTMLTextAreaElement>,
        history: History,
        setHistory: React.Dispatch<React.SetStateAction<History>>,
    ) => {
        const { value, selectionStart } = e.currentTarget;
        updateHistory(value, history, setHistory);
        suggestionRef.current?.handleInput(value, selectionStart);
    };

    const adjustHeight = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + 20}px`;
    };

    const navigateToTemplateNode = async (oid: string | null) => {
        if (!oid) {
            console.error('No templateNode ID provided for navigation.');
            return;
        }

        try {
            await window.api.invoke(MainChannels.VIEW_SOURCE_CODE, oid);
        } catch (error) {
            console.error('Error opening TemplateNode in IDE:', error);
        }
    };

    useEffect(() => {
        if (instanceRef.current) {
            adjustHeight(instanceRef.current);
        }
    }, [instanceHistory.present]);

    useEffect(() => {
        if (rootRef.current) {
            adjustHeight(rootRef.current);
        }

        if (rootRef.current) {
            resizeObserver?.disconnect();
            resizeObserver = new ResizeObserver(() => {
                adjustHeight(rootRef.current!);
            });
            resizeObserver.observe(rootRef.current);

            return () => {
                resizeObserver?.disconnect();
            };
        }
    }, [rootHistory.present]);

    const EnterIndicator = ({ isInstance = false }: { isInstance?: boolean }) => {
        return (
            <div
                className={cn(
                    'absolute bottom-1 right-2 text-xs flex items-center',
                    isInstance
                        ? 'text-purple-300 dark:text-purple-300 selection:text-purple-50 selection:bg-purple-500/50 dark:selection:text-purple-50 dark:selection:bg-purple-500/50'
                        : 'text-gray-500 selection:bg-gray-200 dark:selection:bg-gray-700',
                )}
            >
                <span>enter to apply</span>
                <Icons.Return className="ml-0.5" />
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-2 text-xs text-foreground-analogia shadow-none">
            {selectedEl?.oid && (
                <div className="relative">
                    <div className="group cursor-pointer">
                        {selectedEl.instanceId && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className={cn(
                                            'w-full flex items-center rounded-t h-6 px-1.5 gap-1 transition-colors border-[0.5px]',
                                            editorEngine.style.mode === StyleMode.Root
                                                ? 'bg-background-primary text-foreground-active border-background-tertiary'
                                                : 'bg-background-secondary text-foreground-muted border-background-secondary group-hover:bg-background-primary/20 group-hover:text-foreground-active group-hover:border-background-tertiary/90 cursor-pointer',
                                        )}
                                        onClick={() => {
                                            editorEngine.style.mode = StyleMode.Root;
                                            rootRef.current?.focus();
                                        }}
                                    >
                                        <Icons.Component className="h-3 w-3" />{' '}
                                        {'Main Component Classes'}
                                    </button>
                                </TooltipTrigger>
                                <TooltipPortal container={document.getElementById('style-tab-id')}>
                                    <TooltipContent>
                                        {'Changes apply to component code. This is the default.'}
                                    </TooltipContent>
                                </TooltipPortal>
                            </Tooltip>
                        )}
                        <Textarea
                            ref={rootRef}
                            className={cn(
                                'w-full text-xs break-normal p-1.5 focus-visible:ring-0 resize-none shadow-none border-[0.5px]',
                                'transition-colors duration-150',
                                editorEngine.style.mode === StyleMode.Root
                                    ? 'bg-background-tertiary text-foreground-active border-background-tertiary cursor-text'
                                    : 'bg-background-secondary/75 text-foreground-muted border-background-secondary/75 group-hover:bg-background-tertiary/50 group-hover:text-foreground-active group-hover:border-background-tertiary/50 cursor-pointer',
                                selectedEl.instanceId
                                    ? 'rounded-t-none'
                                    : 'bg-background-secondary/75 focus:bg-background-tertiary',
                            )}
                            placeholder="Add tailwind classes here"
                            value={
                                rootHistory.error
                                    ? 'Warning: ' + rootHistory.error + ' Open the code to edit.'
                                    : rootHistory.present
                            }
                            readOnly={!!rootHistory.error}
                            onInput={(e) => handleInput(e, rootHistory, setRootHistory)}
                            onKeyDown={(e) => handleKeyDown(e, rootHistory, setRootHistory)}
                            onBlur={(e) => {
                                setShowSuggestions(false);
                                setIsRootFocused(false);
                                selectedEl.oid &&
                                    didChangeFromOriginal(rootHistory, e.target.value) &&
                                    createCodeDiffRequest(selectedEl.oid, e.target.value);
                            }}
                            onFocus={() => {
                                editorEngine.style.mode = StyleMode.Root;
                                setIsRootFocused(true);
                            }}
                            onClick={() => {
                                if (editorEngine.style.mode !== StyleMode.Root) {
                                    editorEngine.style.mode = StyleMode.Root;
                                    rootRef.current?.focus();
                                }
                            }}
                        />
                        {isRootFocused && (
                            <AutoComplete
                                ref={suggestionRef}
                                showSuggestions={showSuggestions}
                                currentInput={rootHistory.present}
                                setShowSuggestions={setShowSuggestions}
                                setCurrentInput={(newValue: string) => {
                                    updateHistory(newValue, rootHistory, setRootHistory);
                                    selectedEl.oid &&
                                        didChangeFromOriginal(rootHistory, newValue) &&
                                        createCodeDiffRequest(selectedEl.oid, newValue);
                                }}
                            />
                        )}
                    </div>
                    {rootHistory.error ? (
                        <div className="absolute bottom-1 right-1 text-xs flex items-center">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents unfocusing the textarea
                                    navigateToTemplateNode(selectedEl?.oid);
                                }}
                            >
                                Open <Icons.ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    ) : (
                        isRootFocused && <EnterIndicator />
                    )}
                </div>
            )}

            {selectedEl?.instanceId && (
                <div className="relative">
                    <div
                        className={cn(
                            'group',
                            editorEngine.style.mode !== StyleMode.Instance && 'cursor-pointer',
                        )}
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className={cn(
                                        'w-full flex items-center rounded-t h-6 px-1.5 gap-1 transition-colors border-[0.5px]',
                                        editorEngine.style.mode === StyleMode.Instance
                                            ? 'bg-purple-600 text-purple-50 border-purple-600 dark:bg-purple-700 dark:text-purple-50 dark:border-purple-700'
                                            : 'bg-background-secondary text-foreground-muted border-background-secondary/90 group-hover:bg-purple-200 group-hover:text-purple-900 group-hover:border-purple-200 dark:group-hover:bg-purple-900/50 dark:group-hover:text-purple-100 dark:group-hover:border-purple-900/50',
                                    )}
                                    onClick={() => {
                                        editorEngine.style.mode = StyleMode.Instance;
                                        instanceRef.current?.focus();
                                    }}
                                >
                                    <Icons.ComponentInstance className="h-3 w-3" /> Instance Classes
                                </button>
                            </TooltipTrigger>
                            <TooltipPortal container={document.getElementById('style-tab-id')}>
                                <TooltipContent>{'Changes apply to instance code.'}</TooltipContent>
                            </TooltipPortal>
                        </Tooltip>
                        <Textarea
                            ref={instanceRef}
                            className={cn(
                                'w-full text-xs break-normal p-1.5 focus-visible:ring-0 resize-none shadow-none rounded-t-none border-[0.5px]',
                                'transition-colors duration-150',
                                editorEngine.style.mode === StyleMode.Instance
                                    ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/75 dark:text-purple-100 dark:border-purple-600'
                                    : 'bg-background-secondary/75 text-foreground-muted border-background-secondary/75 group-hover:bg-purple-100/50 group-hover:text-purple-900 group-hover:border-purple-200 dark:group-hover:bg-purple-900/30 dark:group-hover:text-purple-100 dark:group-hover:border-purple-900/30 cursor-pointer',
                            )}
                            placeholder="Add tailwind classes here"
                            value={
                                instanceHistory.error
                                    ? 'Warning: ' +
                                      instanceHistory.error +
                                      ' Open the code to edit.'
                                    : instanceHistory.present
                            }
                            readOnly={!!instanceHistory.error}
                            onInput={(e) => handleInput(e, instanceHistory, setInstanceHistory)}
                            onKeyDown={(e) => handleKeyDown(e, instanceHistory, setInstanceHistory)}
                            onBlur={(e) => {
                                setShowSuggestions(false);
                                setIsInstanceFocused(false);
                                selectedEl?.instanceId &&
                                    didChangeFromOriginal(instanceHistory, e.target.value) &&
                                    createCodeDiffRequest(selectedEl.instanceId, e.target.value);
                            }}
                            onFocus={() => {
                                editorEngine.style.mode = StyleMode.Instance;
                                setIsInstanceFocused(true);
                            }}
                            onClick={() => {
                                if (editorEngine.style.mode !== StyleMode.Instance) {
                                    editorEngine.style.mode = StyleMode.Instance;
                                    instanceRef.current?.focus();
                                }
                            }}
                        />
                        {isInstanceFocused && (
                            <AutoComplete
                                ref={suggestionRef}
                                showSuggestions={showSuggestions}
                                currentInput={instanceHistory.present}
                                setShowSuggestions={setShowSuggestions}
                                setCurrentInput={(newValue: string) => {
                                    updateHistory(newValue, instanceHistory, setInstanceHistory);
                                    selectedEl?.instanceId &&
                                        didChangeFromOriginal(instanceHistory, newValue) &&
                                        createCodeDiffRequest(selectedEl?.instanceId, newValue);
                                }}
                            />
                        )}
                    </div>
                    {instanceHistory.error ? (
                        <div className="absolute bottom-1 right-2 text-xs flex items-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents unfocusing the textarea
                                    navigateToTemplateNode(selectedEl?.oid);
                                }}
                            >
                                Open <Icons.ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    ) : (
                        isInstanceFocused && <EnterIndicator />
                    )}
                </div>
            )}
        </div>
    );
});

export default TailwindInput;
