/** @format */

import React from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDialog } from '@/context/DialogContext';

const WrapperDeleteComponent = () => {
	const { isDeleteDialogOpen, closeDeleteDialog, onDeleteRef } = useDialog();

	const handleDelete = () => {
		if (onDeleteRef.current) {
			onDeleteRef.current();
		}
		closeDeleteDialog();
	};

	return (
		<AlertDialog
			open={isDeleteDialogOpen}
			onOpenChange={closeDeleteDialog}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete this?</AlertDialogTitle>
					<AlertDialogDescription>
						It will be removed permanently. This cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={closeDeleteDialog}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export const WrapperDelete = React.memo(WrapperDeleteComponent);
