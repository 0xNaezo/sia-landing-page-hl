Hand-drawn monochrome marks, not part of the Noto set next door.

Both replace text symbols (`★`, `✓`) that the stylesheets colour themselves, so they
paint with `currentColor` instead of carrying their own fill — swapping in a colour
emoji here would override `var(--gold)` / `var(--amber)` and change the design.

`line-*` are the row icons of the Why comparison table: outline marks that the table
colours amber through `currentColor`, same reason as above.
