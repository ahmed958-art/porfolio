# Portfolio

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.9.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Contact Form Setup

### Fastest (Formspree)

1. Create a free form at https://formspree.io/
2. Copy your form endpoint (example: `https://formspree.io/f/abcxyzpq`)
3. Replace `REPLACE_WITH_YOUR_FORM_ID` in `src/app/pages/contact/contact.html`
4. Submit the form once from your site to verify your email

The current form fields sent are:

- `name`
- `email`
- `projectType`
- `message`

### Best long-term (Backend API + email provider)

When you are ready, switch the form from Formspree to your backend endpoint.

- Frontend sends JSON to your API (example: `POST /api/contact`)
- Backend validates input and sends email using Nodemailer/Resend/SendGrid
- Keep email credentials only on backend (never in frontend)
