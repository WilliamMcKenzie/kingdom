package main

import (
	"bytes"
	"gameserver/engine/maps"
	"testing"

	"github.com/studio-imperium/atlas"
)

func TestGeneratedMapsLoad(t *testing.T) {
	for name, biomes := range map[string][]atlas.Biome{"desert": DesertOnly, "island": Island} {
		t.Run(name, func(t *testing.T) {
			world := atlas.NewWorld(64, 32, 11)
			world.InfectFrom(biomes, 1, atlas.Point{X: 32, Y: 32})
			var data bytes.Buffer
			writeWorld(&data, world)
			loaded, err := maps.Load(&data)
			if err != nil {
				t.Fatal(err)
			}
			if int(loaded.Size) != world.Size || len(loaded.Cells) != len(world.Cells) {
				t.Fatal("map dimensions changed during export")
			}
			indices := make(map[*atlas.Cell]uint16)
			for i, cell := range world.Cells {
				indices[cell] = uint16(i)
			}
			for i, original := range world.Cells {
				cell := loaded.Cells[i]
				if cell.Biome != uint8(original.GetBiome()) || cell.Origin.X != uint16(original.Origin.X) || cell.Origin.Y != uint16(original.Origin.Y) {
					t.Fatal("cell biome or origin changed during export")
				}
				adjacent := original.GetAdjacentCells()
				if len(cell.Adjacent) != len(adjacent) || len(cell.Tiles) != len(original.Tiles) {
					t.Fatal("cell adjacency or tile count changed during export")
				}
				for j, neighbor := range adjacent {
					if cell.Adjacent[j].Idx != indices[neighbor] {
						t.Fatal("cell adjacency changed during export")
					}
				}
				values := make(map[int]uint8)
				for _, tile := range original.Tiles {
					values[tile.X+tile.Y*world.Size] = uint8(tile.Value)
				}
				for _, tile := range cell.Tiles {
					if value, ok := values[int(tile.X)+int(tile.Y)*world.Size]; !ok || value != tile.Val {
						t.Fatal("tile position or type changed during export")
					}
				}
			}
		})
	}
}
