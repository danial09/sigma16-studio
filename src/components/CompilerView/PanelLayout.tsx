import React, { useEffect, useRef } from 'react';
import { GoldenLayout, ComponentContainer, LayoutConfig } from 'golden-layout';
import PanelToolbar from './PanelToolbar';
import SourcePanel from './SourcePanel';
import IrPanel from './IrPanel';
import AsmPanel from './AsmPanel';
import 'golden-layout/dist/css/goldenlayout-base.css';

const registerPanelMount = (
    layout: GoldenLayout,
    componentType: string,
    mountId: string,
) => {
    layout.registerComponentFactoryFunction(
        componentType,
        (container: ComponentContainer) => {
            let element = container.element.querySelector(`#${mountId}`) as HTMLElement | null;
            if (!element) {
                element = document.createElement('div');
                element.id = mountId;
                container.element.appendChild(element);
            }

            return undefined;
        },
    );
};

const PanelLayout: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const layoutRef = useRef<GoldenLayout | null>(null);

    useEffect(() => {
        if (!containerRef.current || layoutRef.current) return;

        const config: LayoutConfig = {
            settings: {
                // hasHeaders: false,
            },
            root: {
                type: 'row',
                content: [
                    {
                        type: 'component',
                        componentType: 'source',
                        title: 'Source',
                        width: 25,
                        componentState: {},
                        isClosable: false,
                    },
                    {
                        type: 'row',
                        content: [
                            {
                                type: 'component',
                                componentType: 'ir',
                                title: 'IR',
                                componentState: {},
                                isClosable: false,
                            },
                            {
                                type: 'component',
                                componentType: 'asm',
                                title: 'Assembly',
                                componentState: {},
                                isClosable: false,
                            },
                        ],
                    },
                ],
            },
        };

        const containerEl = containerRef.current;
        const layout = new GoldenLayout(containerEl);

        layout.resizeWithContainerAutomatically = true;

        registerPanelMount(layout, 'source', 'source-panel-mount');
        registerPanelMount(layout, 'ir', 'ir-panel-mount');
        registerPanelMount(layout, 'asm', 'asm-panel-mount');

        layout.loadLayout(config);
        layoutRef.current = layout;

        const resizeObserver = new ResizeObserver(() => {
            if (!containerEl) return;
            layout.setSize(containerEl.clientWidth, containerEl.clientHeight);
        });

        resizeObserver.observe(containerEl);

        return () => {
            resizeObserver.disconnect();
            layout.destroy();
            layoutRef.current = null;
        };
    }, []);

    return (
        <>
            <PanelToolbar />
            <div ref={containerRef} className="panel-layout-container" />
            <SourcePanel />
            <IrPanel />
            <AsmPanel />
        </>
    );
};

export default PanelLayout;