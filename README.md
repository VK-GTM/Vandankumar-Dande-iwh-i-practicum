# Integrating With HubSpot I: Foundations — Study Projects Practicum

A Node.js application built for the **HubSpot Academy Integrating With HubSpot I: Foundations Practicum**. It uses Express, Axios, and Pug to make HubSpot CRM API requests and display, create, and update records for a custom object named **Study Projects**.

The project was developed from the [official HubSpot Academy starter repository](https://github.com/HubSpot-Academy/integrating-with-hubspot-i-foundations-practicum).

## HubSpot Developer Test Account

**Study Projects custom-object list:**

**Developer test-account custom-object URL:** https://app.hubspot.com/contacts/247795564/objects/2-270751630/views/all/list

| Detail | Value |
|---|---|
| Test account | Foundations Practicum Test |
| Test account ID | 247795564 |
| Custom object | Study Projects |
| Object type ID | 2-270751630 |
| Authentication | HubSpot Service Key (stored locally) |

The custom object was created in the developer test account. Four records have been verified in both HubSpot CRM and the application, including a record submitted through the application form.

## My Practicum Project

I built a Study Projects application using Node.js, Express, Axios, and Pug. It connects to a HubSpot developer test account and retrieves custom-object records through HubSpot's CRM APIs.

The homepage displays records and their properties in a table. A separate form allows users to create new records, and the application redirects to the homepage after a successful API request.

I tested the application locally and confirmed that a record created through the form appeared both in the application and in HubSpot CRM.

## Custom Object and Properties

| Display label | Internal name | Type |
|---|---|---|
| Name | `name` | String (text), required |
| Category | `project_category` | String (text), required |
| Status | `project_status` | String (text) |
| Notes | `project_notes` | String (textarea) |

The custom-object schema specifies an association with **Contacts** using `associatedObjects: ['CONTACT']`. The association should also be confirmed in HubSpot's data model before submitting the practicum.

The test account contains four records:

- API integration checklist
- CRM data quality review
- Customer portal prototype
- HubSpot CRM Integration Demo

The fourth record was created through the application's form and verified in HubSpot CRM.

## Required Routes and Templates

| HTTP route | Template | Function |
|---|---|---|
| `GET /` | `views/homepage.pug` | Retrieves custom-object records using the HubSpot API and displays their properties in a table. Includes the **Add to this table** link. |
| `GET /update-cobj` | `views/updates.pug` | Displays the record-creation form, the required page title, and the **Return to the homepage** link. |
| `POST /update-cobj` | Redirect to homepage | Creates a record in HubSpot CRM using submitted form data and redirects to the homepage. |

Optional edit routes are also included for modifying existing records.

## Local Setup

**Prerequisites:** Node.js, npm, Git, and a HubSpot developer test account with the required API permissions.

1. Clone your GitHub fork and open the project directory.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to a local `.env` file.
4. Add your HubSpot developer test-account Service Key to `HUBSPOT_ACCESS_TOKEN` in `.env`.
5. Set `HUBSPOT_OBJECT_TYPE=2-270751630` in `.env`.
6. Run `node index.js` or `npm start`.
7. Open `http://localhost:3000` to view the custom-object table.
8. Open `http://localhost:3000/update-cobj` to create a record.

The project provides `npm run setup:schema` to create or inspect the custom-object schema and `npm run seed` to create three sample records. Avoid rerunning the seed script unnecessarily because it may create duplicate records.

Never commit the actual `.env` file or share your API credentials.

## Testing and Verification

The following checks have been completed:

- `npm run check` — JavaScript syntax validation passed.
- `npm test` — All **18 automated tests passed**.
- GitHub Actions — The checked Node.js workflow on `working-branch` completed successfully.
- Live GET API — Successfully retrieved three custom-object records on the homepage.
- Live POST API — Successfully created a fourth record and redirected to the homepage.
- CRM verification — The newly created record appeared in HubSpot and in the Node.js application.

The application demonstrated successful integration between Node.js and HubSpot CRM.

For additional verification, run:

`npm run check`

`npm test`

`npm run submission:check`

`node index.js`

Automated tests use mocked HubSpot responses and do not replace live CRM verification. The Contacts association still requires a final check in HubSpot.

## API Authentication and Security

The application authenticates using a HubSpot test-account Service Key sent as a Bearer token.

The following permissions are configured:

- `crm.schemas.custom.read`
- `crm.schemas.custom.write`
- `crm.objects.custom.read`
- `crm.objects.custom.write`
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`

The HubSpot Academy instructions refer to a private app. This test account uses a Service Key because of HubSpot's changes to legacy private-app creation.

The actual credential is stored locally in `.env`, which is excluded from Git tracking using `.gitignore`. No private credentials are included in the repository.

## Git Workflow and Submission

The practicum development was performed on `working-branch`, beginning with the first commit message required by HubSpot Academy.

The application files, tests, and documentation have been committed and pushed to GitHub.

Before submission, the remaining steps are to verify the Contacts association, complete the final checks, review the work for originality, and merge `working-branch` into `main`.

The completed public repository should be submitted through the **Add link** field in HubSpot Academy.

Do not upload a ZIP file, localhost URL, hosted-page preview, or HubSpot page-editor link.

**Public GitHub repository:**

https://github.com/VK-GTM/Vandankumar-Dande-iwh-i-practicum

HubSpot Academy manually grades submissions, generally within seven business days.

**Academic integrity:** HubSpot requires original work and reviews meaningful development history. Automated tests and a working integration alone do not establish originality. The submitted implementation should be work you have reviewed, understood, and meaningfully developed yourself.