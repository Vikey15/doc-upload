import { format } from 'date-fns';

export default function convertToReadableDate(dateString) {
    if (dateString) {
        const date = new Date(dateString);
        return format(date, 'yyyy-MM-dd HH:mm:ss');  // Adjust the format as needed
    } else {
        return "--";
    }
}

