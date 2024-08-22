import React, {ReactNode} from 'react';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/modal";
import {Button, ButtonProps} from "@nextui-org/react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    header: string;
    body: ReactNode;
    footerButtons: ButtonProps[]

}

export default function AppModal({isOpen, onClose, header, body, footerButtons}: Props) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement={'top-center'}>

            <ModalContent>
                <ModalHeader className={'flex flex-col gap-1'}>
                    <ModalBody>{body}</ModalBody>
                    <ModalFooter>
                        {footerButtons.map((props: ButtonProps, index) => (
                            <Button {...props} key={index}>
                                {props.children}
                            </Button>
                        ))}
                    </ModalFooter>
                </ModalHeader>
            </ModalContent>

        </Modal>
    );
};