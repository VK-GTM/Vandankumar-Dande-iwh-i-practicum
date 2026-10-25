# Integrating With HubSpot I: Foundations — Study Projects Practicum

A Node.js/Express app that demonstrates GET and POST calls to HubSpot's custom-object API and renders data using Pug. Based on the [HubSpot Academy starter repository](https://github.com/HubSpot-Academy/integrating-with-hubspot-i-foundations-practicum).

> **Grading notice:** This is a reference implementation, not evidence that the practicum has been personally completed. HubSpot requires original work and reviews real development commit history. Before submitting, review and adapt the code, work on a `working-branch`, run the application against your own developer test account, and merge your verified changes into `main`.

## REQUIRED: test account and list view link

**Developer test-account custom-object URL:** https://app.hubspot.com/contacts/247795564/objects/2-270751630/views/all/list

Replace `NOT CONFIGURED` **after creating the real object in your HubSpot developer test account** with the exact link copied from that account. The expected form is:

`https://app.hubspot.com/contacts/<test-account-id>/objects/<custom-object-id>/views/all/list`

**Never include your private app token or Service Key in the repository.**

## Exact Academy routes and templates

| Route | Template | Function |
| --- | --- | --- |
| `GET /` | `views/homepage.pug` | Uses Axios and the CRM objects GET API to read all four custom property values and display them in a table. Includes **Add to this table** link. |
| `GET /update-cobj` | `views/updates.pug` | Shows the form and the exact title **Update Custom Object Form | Integrating With HubSpot I Practicum**. Includes **Return to the homepage** link. |
| `POST /update-cobj` | Redirect | Sends form data to HubSpot to create a custom-object record; redirects to `/` after success. |

Additional optional routes for updating existing records are included; these do not replace the three mandatory routes.

### Custom object

- **Object:** Study Projects (`study_projects`)
- **Name** (`name`) — string, text, required; exactly labeled **Name**.
- **Category** (`project_category`) — string, text, required.
- **Status** (`project_status`) — string, text.
- **Notes** (`project_notes`) — string, textarea.
- **Associated object type:** contacts (`CONTACT`) — defined in the schema.
- **Records:** at least three genuine HubSpot test-account records. `npm run seed` can create three examples; verify they actually exist in HubSpot before submission.

## Developer test-account setup (do this yourself)

1. Create a **developer test account** rather than using a production portal. Set up the scoped authentication credential within that account, named `YourFirstName's Practicum Private App` if the legacy private-app flow is available. Grant all six read/write scopes requested in the assignment:
   - `crm.schemas.custom.read` and `crm.schemas.custom.write`
   - `crm.objects.custom.read` and `crm.objects.custom.write`
   - `crm.objects.contacts.read` and `crm.objects.contacts.write`
2. **HubSpot changed authentication in 2026:** creation of legacy private apps is unavailable for accounts created on or after 2026-09-28, and scheduled to be disabled for older accounts on 2026-10-26. If your account does not offer private-app creation, use **Settings → Integrations → Service Keys** with equivalent scopes and explain that limitation if Academy asks. Existing private app tokens continue working. [HubSpot official announcement](https://developers.hubspot.com/changelog/legacy-private-app-creation-sunset). Do not invent a private app or fake the required credential.
3. Create a local `.env` from `.env.example` and put the real credential **only in `.env`**, never GitHub.
4. `npm install` (dependencies: axios, dotenv, express, pug).
5. `npm run setup:schema` creates or discovers the Study Projects schema, with **Name** and CONTACT association. If your test portal does not allow custom objects, the Academy instructions allow standard CRM objects, but this code uses custom objects and must be adjusted before taking that fallback.
6. Copy the printed `HUBSPOT_OBJECT_TYPE=2-...` into `.env` (blank in `.env.example`).
7. `npm run seed` creates three example custom-object records. Check all three appear in the **test account**.
8. `node index.js`, then visit `http://localhost:3000`. Check the table displays records and fields. Visit `http://localhost:3000/update-cobj`, create another record, and verify it appears in both HubSpot and on the homepage. Optionally test the edit feature.
9. Copy your real list-view URL from HubSpot and replace `NOT CONFIGURED` above. Run `npm run submission:check`; complete outstanding checks.

## Working branch / authentic development history

Your Academy directions specifically require creating a branch, making your first **actual** development commit with the specified message, and merging the branch to main. Do not create artificial commits to pretend that work happened. Starting with your *own fork*:

```bash
git clone https://github.com/<your-account>/<your-fork>.git
cd <your-fork>
git branch working-branch
git checkout working-branch
# Make your initial real changes, then:
git add .
git commit -m "First commit to my Integrating With HubSpot I: Foundations practicum repository."
# Continue development with meaningful commits while testing and correcting issues.
git push -u origin working-branch
# After reviewing and testing, merge working-branch into main via a GitHub PR.
```

The repository name is expected to be `<first-name>-<last-name>-iwh-i-practicum`. If your fork was created under another name, rename it under GitHub **Settings → General → Repository name**; GitHub ordinarily redirects the old repository URL.

## Commands

```bash
npm install
npm run check
npm test
npm run setup:schema
npm run seed
node index.js
npm run submission:check
```

`npm run check` and `npm test` verify code with mocked data. They do **not** prove the real test account has the required object, contacts association, and three records. The submission checker checks code and local configuration but cannot authenticate without your credential.

## API and security

Authentication uses a HubSpot test-account private app token or current Service Key as a Bearer token. `.env` and `node_modules/` are ignored via `.gitignore`. Do not share credentials in screenshots, GitHub, or chat. The custom-object schema is created through `POST /crm-object-schemas/v3/schemas`, and records are accessed through `/crm/v3/objects/{objectType}`.

## Submission (after live verification)

Only submit a **public GitHub repository URL** in the Academy **Add link** field. Do not upload a ZIP, deployment URL, page preview, or in-app editor link. Submit the merged `main` branch after meaningful original development history and the real test-account list URL have been recorded. HubSpot grades this manually within seven business days.

If you cannot create the required private app because of HubSpot's 2026 platform change, email [developerpracticums@hubspot.com](mailto:developerpracticums@hubspot.com) for current approved guidance, rather than falsely claiming to have created it.

## My Practicum Project

I built a Study Projects application using Node.js,
Express, Axios, and Pug.

The application will integrate with HubSpot CRM using API
requests and a custom object containing project information.

The homepage will display records in a table, and a separate
form will allow users to create new records.

I will test the application using a HubSpot developer test
account and document the integration in this repository.
