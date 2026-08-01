import { ImageCanvas, UWDocSheet } from 'bli-image-studio';

/** Neutral property-inspection evidence sheet (white, grain off). */
export const PropertyInspection = () => (
  <ImageCanvas format="flyer" background="white" grain={false} scale={0.3}>
    <UWDocSheet
      title="Property Inspection — Exterior"
      subtitle="Homeowners documentation"
      meta={[
        { label: 'Date', value: '—' },
        { label: 'Inspector', value: '—' },
        { label: 'Reference', value: '—' },
      ]}
      cells={[
        { label: 'Roof — south slope', note: 'Granule loss visible', callout: 'circle' },
        { label: 'Gutter — NE corner', note: 'Separation at seam', callout: 'arrow' },
        { label: 'Siding — west wall', note: 'No visible damage' },
        { label: 'Driveway / VIN plate', note: 'Plate redacted for privacy', redact: true },
      ]}
    />
  </ImageCanvas>
);

/** Two-cell auto documentation. */
export const AutoDamage = () => (
  <ImageCanvas format="header" background="white" grain={false} scale={0.34}>
    <UWDocSheet
      title="Vehicle Damage — Documentation"
      cells={[
        { label: 'Front bumper', note: 'Impact damage, driver side', callout: 'circle' },
        { label: 'Plate', note: 'Redacted', redact: true },
      ]}
    />
  </ImageCanvas>
);
