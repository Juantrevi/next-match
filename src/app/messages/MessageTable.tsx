'use client'

import React from 'react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";
import {MessageDto} from "@/types";
import {Card} from "@nextui-org/card";
import MessageTableCell from "@/app/messages/MessageTableCell";
import {useMessages} from "@/hooks/useMessages";

type Props = {
    initialMessages: MessageDto[],
    nextCursor?: string
}

export default function MessageTable({initialMessages, nextCursor}: Props) {

    const {
        columns,
        isOutbox,
        isDeleting,
        deleteMessage,
        selectRow,
        messages,
        loadMore,
        loadingMore,
        hasMore

    } = useMessages(initialMessages, nextCursor);


    return (
        <div className={'flex flex-col h-[80vh]'}>
            <Card>
                <Table
                    aria-label={'Table with messages'}
                    selectionMode={'single'}
                    onRowAction={(key) => selectRow(key)}
                    shadow={'none'}
                    className={'flex flex-col gap-3 h-[80vh] overflow-auto'}
                >
                    <TableHeader columns={columns}>
                        {(column) =>
                            <TableColumn key={column.key} width={column.key === 'text' ? '50%' : undefined}>
                                {column.label}
                            </TableColumn> }
                    </TableHeader>
                    <TableBody items={messages} emptyContent={'No messages for this container'}>
                        {(item) => (
                            <TableRow key={item.id} className={'cursor-pointer'}>
                                {(columnKey) => (
                                    <TableCell className={`${!item.dateRead && !isOutbox ? 'font-semibold' : ''}`}>
                                        <MessageTableCell
                                            item={item}
                                            columnKey={columnKey as string}
                                            isOutbox={isOutbox}
                                            deleteMessage={deleteMessage}
                                            isDeleting={isDeleting.loading && isDeleting.id === item.id}
                                        />
                                    </TableCell> // This was missing, closing TableCell
                                )}
                            </TableRow> // Moved here to correctly close TableRow after TableCell
                        )}
                    </TableBody>

                </Table>
                <div className={'sticky bottom-0 pb-3 mr-3 text-right'}>
                    <Button
                        color={'secondary'}
                        isLoading={loadingMore}
                        disabled={!hasMore}
                        onClick={loadMore}
                    >
                        {hasMore ? 'Load more' : 'No more messages'}

                    </Button>
                </div>
            </Card>
        </div>
    );
};