import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  onFormSubmit(event: SubmitEvent): void {
    const form = event.target as HTMLFormElement | null;
    if (!form) {
      event.preventDefault();
      return;
    }

    const fieldNames = ['name', 'email', 'projectType', 'message'];

    for (const fieldName of fieldNames) {
      const field = form.elements.namedItem(fieldName) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!field) {
        continue;
      }

      const trimmedValue = field.value.trim();
      if (!trimmedValue) {
        field.setCustomValidity('Please fill out this field.');
      } else {
        field.value = trimmedValue;
        field.setCustomValidity('');
      }
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
    }
  }
}


