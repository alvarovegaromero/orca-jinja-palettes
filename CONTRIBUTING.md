# Contributing to Jinja Palettes

New palettes and color tweaks are very welcome. A palette is about twenty lines of colors, so you
don't need to know how Orca themes work to add one.

## Suggest a palette or a change

If you'd rather not write code,
[open an issue](https://github.com/alvarovegaromero/orca-jinja-palettes/issues/new/choose) with the
theme you'd like and a link to its colors, or a screenshot of what bothers you in an existing one.

## Set up

You need [Node.js](https://nodejs.org) 20 or newer and [Orca](https://github.com/stablyai/orca).
There are no dependencies to install.

```sh
git clone https://github.com/alvarovegaromero/orca-jinja-palettes
cd orca-jinja-palettes
```

## Add a palette

1. Add an entry at the end of `PALETTES` in [`scripts/palettes.mjs`](scripts/palettes.mjs). Copy an
   existing one and change the colors. The roles are described in the
   [README](README.md#make-your-own).
   - Give it a unique `id` and a `title` ending in `(Jinja)`, for example `Catppuccin Mocha (Jinja)`.
   - Keep the first dark and the first light palette where they are: Orca applies those two when
     someone installs the plugin.
2. Run `npm run build`. It writes `themes/<id>.json`, lists it in `orca-plugin.json` and prints any
   color it had to lighten or darken so Orca keeps it (Orca drops a code color under 3:1 contrast).
3. Try it in Orca. Turn off the installed copy first so the two don't compete:

   ```sh
   orca plugin disable alvarovegaromero.jinja-palettes
   orca plugin dev watch .      # Ctrl-C unloads it
   orca plugin enable alvarovegaromero.jinja-palettes   # when you are done
   ```

   Pick your palette in **Settings → Appearance → Dark editor theme** (or Light) and open a Jinja
   file. The [Jinja Syntax examples](https://github.com/alvarovegaromero/orca-jinja-syntax/tree/main/examples)
   cover every role.
4. If the palette is based on an existing theme, add a row to [`THIRD_PARTY.md`](THIRD_PARTY.md)
   with a link and its license. Only use themes under a permissive license such as MIT.
5. Add a row to the table in the [README](README.md#the-palettes).

## Change a palette

Edit its colors in `scripts/palettes.mjs` and run `npm run build`. Don't edit `themes/*.json` by
hand in a pull request: the next build overwrites them.

## Images

You don't need to add screenshots. The maintainer regenerates `media/` before a release with the
render script in [orca-jinja-syntax](https://github.com/alvarovegaromero/orca-jinja-syntax). A
before and after screenshot in the pull request is enough.

## Pull requests

1. Fork the repository and create a branch.
2. Make the change, run `npm run build` and `npm run validate`.
3. Open a pull request with a screenshot of the palette in Orca.

Releases are tagged by the maintainer; users get them with `orca plugin update`.

By contributing you agree that your work is released under the [MIT License](LICENSE).
