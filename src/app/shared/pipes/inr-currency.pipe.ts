import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '../../core/utils/format-currency';

/** Usage: {{ amount | inrCurrency }} -> "₹12,500" */
@Pipe({ name: 'inrCurrency', standalone: true })
export class InrCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '₹0';
    return formatCurrency(value);
  }
}
