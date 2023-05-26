import fetch from "node-fetch";
import { loadBase } from "../../base";
import { JDBCOptions } from "../../connection/types";

const autoCommitText = `
Specifies the cursor sensitivity to request from the database. The behavior depends on the resultSetType:
  - ResultSet.TYPE_FORWARD_ONLY or ResultSet.TYPE_SCROLL_SENSITIVE means that the value of this property 
    controls what cursor sensitivity the Java program requests from the database.
  - ResultSet.TYPE_SCROLL_INSENSITIVE causes this property to be ignored.
`

const dbNameText = `
	
Specifies the database to use for a connection to an independent auxiliary storage pool (ASP). When you specify
a database name, the name must exist in the relational database directory on the system and correspond to either 
an independent ASP or the system default database. The following criteria determine which database is accessed:

- When this property is used to specify a database which corresponds to an independent ASP, 
  the connection is made to the independent ASP. When the specified database does not exist, the connection fails.
- When this property is used to specify *SYSBAS as the database name, the system default database is used.
- When this property is omitted, the initial ASP group specified in the job description for the user profile 
  is used. When the job description does not specify an initial ASP group, the system default database is used.

`


function formatDescription(text: string): string {
  return text
    .trim() // Remove leading and trailing whitespace 
    .replace(/\n/g, "<br>") // Replace line breaks with <br> tags
    .replace(/\s/g, "&nbsp;"); // Replace spaces with non-breaking spaces
}

export async function editJobUi(options: JDBCOptions, jobName?: string): Promise<JDBCOptions|undefined> {
  const base = loadBase();
  const ui = base.customUI();

  ui
    // System properties -------------------------------------------------------------------------------------------------
    .addHeading(`System Properties`, 2)
    .addParagraph(`System properties specify attributes that govern transactions, libraries, and databases.`)
    .addInput(`libraries`, `Library list`, `List of system libraries, separated by commas or spaces`, {rows: 2, default: options.libraries.join(`, `)})
    .addSelect(`auto commit`, `Auto commit`, [
      {value: `true`, description: `True`, text: `Commit (true)`, selected: options["auto commit"] === `true`},
      {value: `false`, description: `False`, text: `No commit (false)`, selected: options["auto commit"] === `false`},
    ], `Specifies whether auto-commit mode is the default connection mode for new connections. Calling AS400JDBCConnection.setAutoCommit(boolean) will override this property on a per-connection basis. Note that, in order to use transaction isolation levels other than *NONE when using auto-commit mode, the property "true autocommit" needs to be set to true.`)
    .addSelect(`concurrent access resolution`, `Concurrent access resolution`, [
      {value: `1`, description: `1`, text: `1`, selected: options["concurrent access resolution"] === `1`},
      {value: `2`, description: `2`, text: `2`, selected: options["concurrent access resolution"] === `2`},
      {value: `3`, description: `3`, text: `3`, selected: options["concurrent access resolution"] === `3`},
    ], `Specifies whether "currently committed" access is used on the connection. A value of 1 indicates that "currently committed" will be used. A value of 2 indicates that "wait for outcome" will be used. A value of 3 indicates that "skip locks" will be used.`)
    .addSelect(`cursor hold`, `Cursor hold`, [
      {value:`true`, description: `True`, text: `true`, selected: options["cursor hold"] === `true`},
      {value:`false`, description: `False`, text: `false`, selected: options["cursor hold"] === `false`}
    ], `	Specifies whether to hold the cursor across transactions. If this property is set to "true", cursors are not closed when a transaction is committed. All resources acquired during the unit of work are held, but locks on specific rows and objects implicitly acquired during the unit of work are released.`)
    .addSelect(`cursor sensitivity`, `Cursor sensitivity`, [
      {value:`asensitive`, description: `Asensitive`, text: `asensitive`, selected: options["cursor sensitivity"] === `asensitive`},
      {value:`insensitive`, description: `Insensitive`, text: `insensitive`, selected: options["cursor sensitivity"] === `insensitive`},
      {value:`sensitive`, description: `Sensitive`, text: `sensitive`, selected: options["cursor sensitivity"] === `sensitive`}
    ], formatDescription(autoCommitText))
    .addInput(`database name`, `Database name`, formatDescription(dbNameText), {default: options["database name"]})
    .addSelect(`decfloat rounding mode`, `Decfloat rounding mode`, [
      {value:`half even`, description: `Half even`, text: `half even`, selected: options["decfloat rounding mode"] === `half even`},
      {value:`half up`, description: `Half up`, text: `half up`, selected: options["decfloat rounding mode"] === `half up`},
      {value:`down`, description: `Down`, text: `down`, selected: options["decfloat rounding mode"] === `down`},
      {value:`ceiling`, description: `Ceiling`, text: `ceiling`, selected: options["decfloat rounding mode"] === `ceiling`},
      {value:`floor`, description: `Floor`, text: `floor`, selected: options["decfloat rounding mode"] === `floor`},
      {value:`up`, description: `Up`, text: `up`, selected: options["decfloat rounding mode"] === `up`},
      {value:`half down`, description: `Half down`, text: `half down`, selected: options["decfloat rounding mode"] === `half down`},
    ], `Specifies the rounding mode to use when working with decfloat data type. Note, this property is ignored when connecting to systems running IBM i V5R4 and earlier.`)
    .addSelect(`maximum precision`, `Maximum precision`, [
      {value:`31`, description: `31`, text: `31`, selected: options["maximum precision"] === `31`},
      {value:`63`, description: `63`, text: `63`, selected: options["maximum precision"] === `63`},
    ], `	Specifies the maximum decimal precision the database should use.`)
    .addInput(`maximum scale`, `Maximum scale`, "Specifies the maximum scale the database should use. 0-63", {default: options["maximum scale"]})
    .addSelect(`minimum divide scale`, `Minimum divide scale`, [
      {value:`0`, description: `0`, text: `0`, selected: options["minimum divide scale"] === `0`},
      {value:`1`, description: `1`, text: `1`, selected: options["minimum divide scale"] === `1`},
      {value:`2`, description: `2`, text: `2`, selected: options["minimum divide scale"] === `2`},
      {value:`3`, description: `3`, text: `3`, selected: options["minimum divide scale"] === `3`},
      {value:`4`, description: `4`, text: `4`, selected: options["minimum divide scale"] === `4`},
      {value:`5`, description: `5`, text: `5`, selected: options["minimum divide scale"] === `5`},
      {value:`6`, description: `6`, text: `6`, selected: options["minimum divide scale"] === `6`},
      {value:`7`, description: `7`, text: `7`, selected: options["minimum divide scale"] === `7`},
      {value:`8`, description: `8`, text: `8`, selected: options["minimum divide scale"] === `8`},
      {value:`9`, description: `9`, text: `9`, selected: options["minimum divide scale"] === `9`},
    ], `Specifies the minimum scale value for the result of decimal division.`)
    .addSelect(`package ccsid`, `Package CCSID`, [
      {value:`1200`, description: `1200`, text: `UTF-16`, selected: options["package ccsid"] === `1200`},
      {value:`13488`, description: `13488`, text: `UCS-2`, selected: options["package ccsid"] === `13488`},
      {value:`system`, description: `system`, text: `host CCSID`, selected: options["package ccsid"] === `system`},
    ], `Specifies the character encoding to use for the SQL package and any statements sent to the system.`)
    .addSelect(`transaction isolation`, `Transaction isolation`, [
      {value: `none`, description: `None`, text: `No commit (none)`, selected: options["transaction isolation"] === `none`},
      {value: `read committed`, description: `Read committed`, text: `read committed`, selected: options["transaction isolation"] === `read committed`},
      {value: `read uncommitted`, description: `Read uncommitted`, text: `read uncommitted`, selected: options["transaction isolation"] === `read uncommitted`},
      {value: `repeatable read`, description: `Repeatable read`, text: `repeatable read`, selected: options["transaction isolation"] === `repeatable read`},
      {value: `serializable`, description: `Serializable`, text: `serializable`, selected: options["transaction isolation"] === `serializable`},
    ], `Specifies the default transaction isolation.`)
    .addSelect(`translate hex`, `Translate hex`,[
      {value:`character`, text: `Interpret hexadecimal literals as character data`, description: `character`, selected: options["translate hex"] === `character`},
      {value:`binary`, text: `Interpret hexadecimal literals as binary data`, description: `binary`, selected: options["translate hex"] === `binary`},
    ], `Specifies how hexadecimal literals are interpreted.`)
    .addSelect(`true autocommit`, `True autocommit`, [
      {value:`false`, text: `Do not use true autocommit`, description: `false`, selected: options["true autocommit"] === `false`},
      {value:`true`, text: `Use true autocommit`, description: `true`, selected: options["true autocommit"] === `true`},
    ], `Specifies whether the connection should use true auto commit support. True autocommit means that autocommit is on and is running under a isolation level other than *NONE. By default, the driver handles autocommit by running under the system isolation level of *NONE.`)
    .addSelect(`XA loosely coupled support`, `XA loosely coupled support`, [
      {value:`0`, text: `Do not share locks`, description: `0`, selected: options["XA loosely coupled support"] === `0`},
      {value:`1`, description: `1`, text: `Share locks`, selected: options["XA loosely coupled support"] === `1`},

    ], `Specifies whether lock sharing is allowed for loosely coupled transaction branches. Note, this property is ignored when connecting to systems running to IBM i V5R3 and earlier. This option can be set to 0 to indicate to not share locks or 1 to share locks.`)

    // Format Properties -------------------------------------------------------------------------------------------------
    .addHeading(`Format Properties`, 2)
    .addParagraph(`Format properties specify date and time formats, date and decimal separators, and table naming conventions used within SQL statements.`)
    .addSelect(`naming`, `Naming`, [
      {value: `system`, text: `as in schema/table`, description: `System naming`, selected: options.naming === `system`},
      {value: `sql`, text: `as in schema.table`, description: `SQL naming`, selected: options.naming === `sql`},
    ], `Specifies the naming convention used when referring to tables.`)

    // Other properties --------------------------------------------------------------------------------------------------
    .addHeading(`Other Properties`, 2)
    .addParagraph(`Other properties are those properties not easily categorized. These properties determine which JDBC driver is used, and specify options related to level of database access, bidirectional string type, data truncation and so on.`)
    .addSelect(`full open`, `Full open`, [
      {value: `false`, text: `Perform pseudo-open for better performance`, description: `Pseudo-open`, selected: options["full open"] !== true},
      {value: `true`, text: `Perform full-open to analyse performance`, description: `Full-open`, selected: options["full open"] === true},
    ], `Specifies whether the system fully opens a file for each query. By default the system optimizes open requests. This optimization improves performance but may fail if a database monitor is active when a query is run more than once. Set the property to true only when identical queries are issued when monitors are active.`)
    .addButtons(
      {id: `apply`, label: `Apply changes`},
      {id: `cancel`, label: `Cancel`},
      )

  const page = await ui.loadPage<{[key: string]: string}>(jobName || `Edit job options`);

  if (page && page.data) {

    page.panel.dispose();
    
    if (page.data.buttons === `apply`) {
      const keys = Object.keys(page.data);

      // We need to play with some of the form data to put it back into JDBCOptions
      for (const key of keys) {
        switch (key) {
          case `libraries`:
            options.libraries = page.data[key].split(`,`).map(v => v.trim());
            break;
          case `full open`:
            options["full open"] = page.data[key] === `true`;
            break;
          case `buttons`:
            // Do nothing with buttons
            break;
          default:
            options[key] = page.data[key];
        }
      }
  
      return options;
    }

  }

  return;
}