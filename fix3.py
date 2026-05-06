path_ts = '/Users/ahmedjaved/Documents/porfolio/src/app/shared/three-d-hover-gallery/three-d-hover-gallery.ts'
with open(path_ts, 'r') as f:
    ts = f.read()

old = (
    "    // Responsive card sizes: use CSS min() so they never overflow\n"
    "    const w = isActive ? 'min(180px, 28vw)' : 'min(70px, 11vw)';\n"
    "    const h = isActive ? 'min(260px, 38vh)' : 'min(180px, 28vh)';"
)
new = (
    "    // Responsive card sizes: use CSS min() so they never overflow\n"
    "    const w = isActive ? 'min(220px, 22vw)' : 'min(110px, 10vw)';\n"
    "    const h = isActive ? 'min(300px, 42vh)' : 'min(220px, 32vh)';"
)

if old in ts:
    ts = ts.replace(old, new, 1)
    with open(path_ts, 'w') as f:
        f.write(ts)
    print("DONE")
else:
    print("NOT FOUND")
