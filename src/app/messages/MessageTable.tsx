'use client'

import React from 'react';
import {useSearchParams} from "next/navigation";
import {getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {MessageDto} from "@/types";

type Props = {
    messages: MessageDto[]
}

export default function MessageTable({messages}: Props) {
    const searchParams = useSearchParams()
    const isOutbox = searchParams.get('container') === 'outbox';

    const columns = [
        {key: isOutbox ? 'recipientName' : 'senderName', label: isOutbox ? 'Recipient': 'Sender'},
        {key: 'text', label: 'Message'},
        {key: 'created', label: isOutbox ? 'Date sent': 'Date received'},

    ]

    return (
        <Table
            aria-label={'Table with messages'}
            selectionMode={'single'}
            onRowAction={(key) => {}}
        >
            <TableHeader columns={columns}>
                {(column) =>
                    <TableColumn key={column.key}>
                        {column.label}
                    </TableColumn> }
            </TableHeader>
            <TableBody items={messages} emptyContent={'No messages for this container'}>
                {(item) => (
                    <TableRow key={item.id} className={'cursor-pointer'}>
                        {(columnKey) => (
                            <TableCell>
                                {getKeyValue(item, columnKey)}
                            </TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>

        </Table>
    );
};