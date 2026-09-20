using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LocadoraVeiculos.API.Data;
using LocadoraVeiculos.API.DTOs;
using LocadoraVeiculos.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VeiculosController : ControllerBase
    {
        private readonly LocadoraContext _context;

        public VeiculosController(LocadoraContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VeiculoResponseDto>>> GetAll()
        {
            var veiculos = await _context.Veiculos
                .Include(v => v.Fabricante)
                .Include(v => v.Categoria)
                .Select(v => new VeiculoResponseDto
                {
                    Id = v.Id,
                    Modelo = v.Modelo,
                    AnoFabricacao = v.AnoFabricacao,
                    Quilometragem = v.Quilometragem,
                    Placa = v.Placa,
                    Cor = v.Cor,
                    Disponivel = v.Disponivel,
                    Fabricante = v.Fabricante.Nome,
                    Categoria = v.Categoria.Nome,
                    ValorDiaria = v.Categoria.ValorDiaria
                })
                .ToListAsync();

            return Ok(veiculos);
        }

        [HttpGet("disponiveis")]
        public async Task<ActionResult<IEnumerable<VeiculoResponseDto>>> GetDisponiveis()
        {
            var veiculos = await _context.Veiculos
                .Include(v => v.Fabricante)
                .Include(v => v.Categoria)
                .Where(v => v.Disponivel)
                .Select(v => new VeiculoResponseDto
                {
                    Id = v.Id,
                    Modelo = v.Modelo,
                    AnoFabricacao = v.AnoFabricacao,
                    Quilometragem = v.Quilometragem,
                    Placa = v.Placa,
                    Cor = v.Cor,
                    Disponivel = v.Disponivel,
                    Fabricante = v.Fabricante.Nome,
                    Categoria = v.Categoria.Nome,
                    ValorDiaria = v.Categoria.ValorDiaria
                })
                .ToListAsync();

            return Ok(veiculos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VeiculoResponseDto>> GetById(int id)
        {
            var v = await _context.Veiculos
                .Include(v => v.Fabricante)
                .Include(v => v.Categoria)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (v == null)
                return NotFound(new { mensagem = $"Veículo com ID {id} não encontrado." });

            return Ok(new VeiculoResponseDto
            {
                Id = v.Id,
                Modelo = v.Modelo,
                AnoFabricacao = v.AnoFabricacao,
                Quilometragem = v.Quilometragem,
                Placa = v.Placa,
                Cor = v.Cor,
                Disponivel = v.Disponivel,
                Fabricante = v.Fabricante.Nome,
                Categoria = v.Categoria.Nome,
                ValorDiaria = v.Categoria.ValorDiaria
            });
        }

        [HttpPost]
        public async Task<ActionResult<VeiculoResponseDto>> Create([FromBody] VeiculoRequestDto dto)
        {
            if (await _context.Veiculos.AnyAsync(v => v.Placa == dto.Placa))
                return Conflict(new { mensagem = $"Já existe um veículo com a placa '{dto.Placa}'." });

            if (!await _context.Fabricantes.AnyAsync(f => f.Id == dto.FabricanteId))
                return BadRequest(new { mensagem = $"Fabricante com ID {dto.FabricanteId} não encontrado." });

            if (!await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId))
                return BadRequest(new { mensagem = $"Categoria com ID {dto.CategoriaId} não encontrada." });

            var veiculo = new Veiculo
            {
                Modelo = dto.Modelo,
                AnoFabricacao = dto.AnoFabricacao,
                Quilometragem = dto.Quilometragem,
                Placa = dto.Placa,
                Cor = dto.Cor,
                Disponivel = true,
                FabricanteId = dto.FabricanteId,
                CategoriaId = dto.CategoriaId
            };

            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = veiculo.Id }, await GetVeiculoResponse(veiculo.Id));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VeiculoRequestDto dto)
        {
            var veiculo = await _context.Veiculos.FindAsync(id);
            if (veiculo == null)
                return NotFound(new { mensagem = $"Veículo com ID {id} não encontrado." });

            if (await _context.Veiculos.AnyAsync(v => v.Placa == dto.Placa && v.Id != id))
                return Conflict(new { mensagem = $"Já existe outro veículo com a placa '{dto.Placa}'." });

            if (!await _context.Fabricantes.AnyAsync(f => f.Id == dto.FabricanteId))
                return BadRequest(new { mensagem = $"Fabricante com ID {dto.FabricanteId} não encontrado." });

            if (!await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId))
                return BadRequest(new { mensagem = $"Categoria com ID {dto.CategoriaId} não encontrada." });

            veiculo.Modelo = dto.Modelo;
            veiculo.AnoFabricacao = dto.AnoFabricacao;
            veiculo.Quilometragem = dto.Quilometragem;
            veiculo.Placa = dto.Placa;
            veiculo.Cor = dto.Cor;
            veiculo.FabricanteId = dto.FabricanteId;
            veiculo.CategoriaId = dto.CategoriaId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var veiculo = await _context.Veiculos
                .Include(v => v.Alugueis)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (veiculo == null)
                return NotFound(new { mensagem = $"Veículo com ID {id} não encontrado." });

            if (veiculo.Alugueis.Any())
                return BadRequest(new { mensagem = "Não é possível excluir um veículo que possui histórico de aluguéis." });

            _context.Veiculos.Remove(veiculo);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<VeiculoResponseDto?> GetVeiculoResponse(int id)
        {
            return await _context.Veiculos
                .Include(v => v.Fabricante)
                .Include(v => v.Categoria)
                .Where(v => v.Id == id)
                .Select(v => new VeiculoResponseDto
                {
                    Id = v.Id,
                    Modelo = v.Modelo,
                    AnoFabricacao = v.AnoFabricacao,
                    Quilometragem = v.Quilometragem,
                    Placa = v.Placa,
                    Cor = v.Cor,
                    Disponivel = v.Disponivel,
                    Fabricante = v.Fabricante.Nome,
                    Categoria = v.Categoria.Nome,
                    ValorDiaria = v.Categoria.ValorDiaria
                })
                .FirstOrDefaultAsync();
        }
    }
}
