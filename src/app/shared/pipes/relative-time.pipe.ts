import { Pipe, PipeTransform } from '@angular/core';
import { formatRelativeTime } from '../../core/utils/format-currency';

@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return formatRelativeTime(value);
  }
}
