import { orderIdsByCalcs, preparePlotData, timeFormatToTemplate } from './utils';
import { FieldType, MutableDataFrame } from '@grafana/data';
import { GraphTransform, StackingMode } from '@grafana/schema';

describe('timeFormatToTemplate', () => {
  it.each`
    format           | expected
    ${'HH:mm:ss'}    | ${'{HH}:{mm}:{ss}'}
    ${'HH:mm'}       | ${'{HH}:{mm}'}
    ${'MM/DD HH:mm'} | ${'{MM}/{DD} {HH}:{mm}'}
    ${'MM/DD'}       | ${'{MM}/{DD}'}
    ${'YYYY-MM'}     | ${'{YYYY}-{MM}'}
    ${'YYYY'}        | ${'{YYYY}'}
  `('should convert $format to $expected', ({ format, expected }) => {
    expect(timeFormatToTemplate(format)).toEqual(expected);
  });
});

describe('preparePlotData', () => {
  const df = new MutableDataFrame({
    fields: [
      { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
      { name: 'a', values: [-10, 20, 10] },
      { name: 'b', values: [10, 10, 10] },
      { name: 'c', values: [20, 20, 20] },
    ],
  });

  it('creates array from DataFrame', () => {
    expect(preparePlotData([df])).toMatchInlineSnapshot(`
      Array [
        Array [
          9997,
          9998,
          9999,
        ],
        Array [
          -10,
          20,
          10,
        ],
        Array [
          10,
          10,
          10,
        ],
        Array [
          20,
          20,
          20,
        ],
      ]
    `);
  });

  describe('transforms', () => {
    it('negative-y transform', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
          { name: 'a', values: [-10, 20, 10] },
          { name: 'b', values: [10, 10, 10] },
          { name: 'c', values: [20, 20, 20], config: { custom: { transform: GraphTransform.NegativeY } } },
        ],
      });
      expect(preparePlotData([df])).toMatchInlineSnapshot(`
        Array [
          Array [
            9997,
            9998,
            9999,
          ],
          Array [
            -10,
            20,
            10,
          ],
          Array [
            10,
            10,
            10,
          ],
          Array [
            -20,
            -20,
            -20,
          ],
        ]
      `);
    });

    it('negative-y transform with null/undefined values', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
          { name: 'a', values: [-10, 20, 10, 30] },
          { name: 'b', values: [10, 10, 10, null] },
          { name: 'c', values: [null, 20, 20, 20], config: { custom: { transform: GraphTransform.NegativeY } } },
          { name: 'd', values: [20, 20, 20, null], config: { custom: { transform: GraphTransform.NegativeY } } },
          { name: 'e', values: [20, null, 20, 20], config: { custom: { transform: GraphTransform.NegativeY } } },
          { name: 'f', values: [10, 10, 10, undefined] },
          { name: 'g', values: [undefined, 20, 20, 20], config: { custom: { transform: GraphTransform.NegativeY } } },
          { name: 'h', values: [20, 20, 20, undefined], config: { custom: { transform: GraphTransform.NegativeY } } },
          { name: 'i', values: [20, undefined, 20, 20], config: { custom: { transform: GraphTransform.NegativeY } } },
        ],
      });
      expect(preparePlotData([df])).toMatchInlineSnapshot(`
        Array [
          Array [
            9997,
            9998,
            9999,
            undefined,
          ],
          Array [
            -10,
            20,
            10,
            30,
          ],
          Array [
            10,
            10,
            10,
            null,
          ],
          Array [
            null,
            -20,
            -20,
            -20,
          ],
          Array [
            -20,
            -20,
            -20,
            null,
          ],
          Array [
            -20,
            null,
            -20,
            -20,
          ],
          Array [
            10,
            10,
            10,
            undefined,
          ],
          Array [
            undefined,
            -20,
            -20,
            -20,
          ],
          Array [
            -20,
            -20,
            -20,
            undefined,
          ],
          Array [
            -20,
            undefined,
            -20,
            -20,
          ],
        ]
      `);
    });
    it('constant transform', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
          { name: 'a', values: [-10, 20, 10], config: { custom: { transform: GraphTransform.Constant } } },
          { name: 'b', values: [10, 10, 10] },
          { name: 'c', values: [20, 20, 20] },
        ],
      });
      expect(preparePlotData([df])).toMatchInlineSnapshot(`
        Array [
          Array [
            9997,
            9998,
            9999,
          ],
          Array [
            -10,
            -10,
            -10,
          ],
          Array [
            10,
            10,
            10,
          ],
          Array [
            20,
            20,
            20,
          ],
        ]
      `);
    });
  });
  describe('stacking', () => {
    it('none', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
          {
            name: 'a',
            values: [-10, 20, 10],
            config: { custom: { stacking: { mode: StackingMode.None } } },
          },
          {
            name: 'b',
            values: [10, 10, 10],
            config: { custom: { stacking: { mode: StackingMode.None } } },
          },
          {
            name: 'c',
            values: [20, 20, 20],
            config: { custom: { stacking: { mode: StackingMode.None } } },
          },
        ],
      });
      expect(preparePlotData([df])).toMatchInlineSnapshot(`
              Array [
                Array [
                  9997,
                  9998,
                  9999,
                ],
                Array [
                  -10,
                  20,
                  10,
                ],
                Array [
                  10,
                  10,
                  10,
                ],
                Array [
                  20,
                  20,
                  20,
                ],
              ]
          `);
    });

    it('standard', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
          {
            name: 'a',
            values: [-10, 20, 10],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
          {
            name: 'b',
            values: [10, 10, 10],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
          {
            name: 'c',
            values: [20, 20, 20],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
        ],
      });
      expect(preparePlotData([df])).toMatchInlineSnapshot(`
        Array [
          Array [
            9997,
            9998,
            9999,
          ],
          Array [
            -10,
            20,
            10,
          ],
          Array [
            0,
            30,
            20,
          ],
          Array [
            20,
            50,
            40,
          ],
        ]
      `);
    });

    it('standard with negative y transform', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
          {
            name: 'a',
            values: [-10, 20, 10],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
          {
            name: 'b',
            values: [10, 10, 10],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
          {
            name: 'c',
            values: [20, 20, 20],
            config: {
              custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' }, transform: GraphTransform.NegativeY },
            },
          },
          {
            name: 'd',
            values: [10, 10, 10],
            config: {
              custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' }, transform: GraphTransform.NegativeY },
            },
          },
        ],
      });
      expect(preparePlotData([df])).toMatchInlineSnapshot(`
        Array [
          Array [
            9997,
            9998,
            9999,
          ],
          Array [
            -10,
            20,
            10,
          ],
          Array [
            0,
            30,
            20,
          ],
          Array [
            -20,
            -20,
            -20,
          ],
          Array [
            -30,
            -30,
            -30,
          ],
        ]
      `);
    });

    it('standard with multiple groups', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
          {
            name: 'a',
            values: [-10, 20, 10],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
          {
            name: 'b',
            values: [10, 10, 10],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
          {
            name: 'c',
            values: [20, 20, 20],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
          {
            name: 'd',
            values: [1, 2, 3],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' } } },
          },
          {
            name: 'e',
            values: [1, 2, 3],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' } } },
          },
          {
            name: 'f',
            values: [1, 2, 3],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' } } },
          },
        ],
      });

      expect(preparePlotData([df])).toMatchInlineSnapshot(`
        Array [
          Array [
            9997,
            9998,
            9999,
          ],
          Array [
            -10,
            20,
            10,
          ],
          Array [
            0,
            30,
            20,
          ],
          Array [
            20,
            50,
            40,
          ],
          Array [
            1,
            2,
            3,
          ],
          Array [
            2,
            4,
            6,
          ],
          Array [
            3,
            6,
            9,
          ],
        ]
      `);
    });

    it('standard with multiple groups and hidden fields', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
          {
            name: 'a',
            values: [-10, 20, 10],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' }, hideFrom: { viz: true } } },
          },
          {
            // Will ignore a series as stacking base as it's hidden from viz
            name: 'b',
            values: [10, 10, 10],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
          },
          {
            name: 'd',
            values: [1, 2, 3],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' } } },
          },
          {
            name: 'e',
            values: [1, 2, 3],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' }, hideFrom: { viz: true } } },
          },
          {
            // Will ignore e series as stacking base as it's hidden from viz
            name: 'f',
            values: [1, 2, 3],
            config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' } } },
          },
        ],
      });

      expect(preparePlotData([df])).toMatchInlineSnapshot(`
        Array [
          Array [
            9997,
            9998,
            9999,
          ],
          Array [
            -10,
            20,
            10,
          ],
          Array [
            10,
            10,
            10,
          ],
          Array [
            1,
            2,
            3,
          ],
          Array [
            1,
            2,
            3,
          ],
          Array [
            2,
            4,
            6,
          ],
        ]
      `);
    });

    describe('ignores nullish-only stacks', () => {
      test('single stacking group', () => {
        const df = new MutableDataFrame({
          fields: [
            { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
            {
              name: 'a',
              values: [-10, null, 10],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
            {
              name: 'b',
              values: [10, null, null],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
            {
              name: 'c',
              values: [20, undefined, 20],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
          ],
        });

        expect(preparePlotData([df])).toMatchInlineSnapshot(`
          Array [
            Array [
              9997,
              9998,
              9999,
            ],
            Array [
              -10,
              null,
              10,
            ],
            Array [
              0,
              null,
              10,
            ],
            Array [
              20,
              null,
              30,
            ],
          ]
        `);
      });
      test('multiple stacking groups', () => {
        const df = new MutableDataFrame({
          fields: [
            { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
            {
              name: 'a',
              values: [-10, undefined, 10],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
            {
              name: 'b',
              values: [10, undefined, 10],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
            {
              name: 'c',
              values: [20, undefined, 20],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
            {
              name: 'd',
              values: [1, 2, null],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' } } },
            },
            {
              name: 'e',
              values: [1, 2, null],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' } } },
            },
            {
              name: 'f',
              values: [1, 2, null],
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackB' } } },
            },
          ],
        });

        expect(preparePlotData([df])).toMatchInlineSnapshot(`
          Array [
            Array [
              9997,
              9998,
              9999,
            ],
            Array [
              -10,
              null,
              10,
            ],
            Array [
              0,
              null,
              20,
            ],
            Array [
              20,
              null,
              40,
            ],
            Array [
              1,
              2,
              null,
            ],
            Array [
              2,
              4,
              null,
            ],
            Array [
              3,
              6,
              null,
            ],
          ]
        `);
      });
    });
    describe('with legend sorted', () => {
      it('should affect when single group', () => {
        const df = new MutableDataFrame({
          fields: [
            { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
            {
              name: 'a',
              values: [-10, 20, 10],
              state: { calcs: { max: 20 } },
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
            {
              name: 'b',
              values: [10, 10, 10],
              state: { calcs: { max: 10 } },
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
            {
              name: 'c',
              values: [20, 20, 20],
              state: { calcs: { max: 20 } },
              config: { custom: { stacking: { mode: StackingMode.Normal, group: 'stackA' } } },
            },
          ],
        });

        expect(preparePlotData([df], undefined, { sortBy: 'Max', sortDesc: false } as any)).toMatchInlineSnapshot(`
                  Array [
                    Array [
                      9997,
                      9998,
                      9999,
                    ],
                    Array [
                      0,
                      30,
                      20,
                    ],
                    Array [
                      10,
                      10,
                      10,
                    ],
                    Array [
                      20,
                      50,
                      40,
                    ],
                  ]
              `);
        expect(preparePlotData([df], undefined, { sortBy: 'Max', sortDesc: true } as any)).toMatchInlineSnapshot(`
                  Array [
                    Array [
                      9997,
                      9998,
                      9999,
                    ],
                    Array [
                      -10,
                      20,
                      10,
                    ],
                    Array [
                      20,
                      50,
                      40,
                    ],
                    Array [
                      10,
                      40,
                      30,
                    ],
                  ]
              `);
      });
    });
  });
});

describe('orderIdsByCalcs', () => {
  const ids = [1, 2, 3, 4];
  const frame = new MutableDataFrame({
    fields: [
      { name: 'time', type: FieldType.time, values: [9997, 9998, 9999] },
      { name: 'a', values: [-10, 20, 10], state: { calcs: { min: -10 } } },
      { name: 'b', values: [20, 20, 20], state: { calcs: { min: 20 } } },
      { name: 'c', values: [10, 10, 10], state: { calcs: { min: 10 } } },
      { name: 'd', values: [30, 30, 30] },
    ],
  });

  it.each([
    { legend: undefined },
    { legend: { sortBy: 'Min' } },
    { legend: { sortDesc: false } },
    { legend: {} },
    { sortBy: 'Mik', sortDesc: true },
  ])('should return without ordering if legend option is %o', (legend: any) => {
    const result = orderIdsByCalcs({ ids, frame, legend });
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('should order the ids based on the frame stat', () => {
    const resultDesc = orderIdsByCalcs({ ids, frame, legend: { sortBy: 'Min', sortDesc: true } as any });
    expect(resultDesc).toEqual([4, 2, 3, 1]);
    const resultAsc = orderIdsByCalcs({ ids, frame, legend: { sortBy: 'Min', sortDesc: false } as any });
    expect(resultAsc).toEqual([1, 3, 2, 4]);
  });
});
