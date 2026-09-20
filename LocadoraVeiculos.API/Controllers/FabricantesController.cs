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
    public class FabricantesController : ControllerBase
    {
        private readonly LocadoraContext _context;

        public FabricantesController(LocadoraContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FabricanteResponseDto>>> GetAll()
        {
            var fabricantes = await _context.Fabricantes
                .Select(f => new FabricanteResponseDto
                {
                    Id = f.Id,
                    Nome = f.Nome,
                    PaisOrigem = f.PaisOrigem
                })
                .ToListAsync();

            return Ok(fabricantes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FabricanteResponseDto>> GetById(int id)
        {
            var fabricante = await _context.Fabricantes.FindAsync(id);
            if (fabricante == null)
                return NotFound(new { mensagem = $"Fabricante com ID {id} não encontrado." });

            return Ok(new FabricanteResponseDto
            {
                Id = fabricante.Id,
                Nome = fabricante.Nome,
                PaisOrigem = fabricante.PaisOrigem
            });
        }

        [HttpPost]
        public async Task<ActionResult<FabricanteResponseDto>> Create([FromBody] FabricanteRequestDto dto)
        {
            if (await _context.Fabricantes.AnyAsync(f => f.Nome == dto.Nome))
                return Conflict(new { mensagem = $"Já existe um fabricante com o nome '{dto.Nome}'." });

            var fabricante = new Fabricante
            {
                Nome = dto.Nome,
                PaisOrigem = dto.PaisOrigem
            };

            _context.Fabricantes.Add(fabricante);
            await _context.SaveChangesAsync();

            var response = new FabricanteResponseDto
            {
                Id = fabricante.Id,
                Nome = fabricante.Nome,
                PaisOrigem = fabricante.PaisOrigem
            };

            return CreatedAtAction(nameof(GetById), new { id = fabricante.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FabricanteRequestDto dto)
        {
            var fabricante = await _context.Fabricantes.FindAsync(id);
            if (fabricante == null)
                return NotFound(new { mensagem = $"Fabricante com ID {id} não encontrado." });

            if (await _context.Fabricantes.AnyAsync(f => f.Nome == dto.Nome && f.Id != id))
                return Conflict(new { mensagem = $"Já existe outro fabricante com o nome '{dto.Nome}'." });

            fabricante.Nome = dto.Nome;
            fabricante.PaisOrigem = dto.PaisOrigem;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var fabricante = await _context.Fabricantes
                .Include(f => f.Veiculos)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fabricante == null)
                return NotFound(new { mensagem = $"Fabricante com ID {id} não encontrado." });

            if (fabricante.Veiculos.Any())
                return BadRequest(new { mensagem = "Não é possível excluir um fabricante que possui veículos cadastrados." });

            _context.Fabricantes.Remove(fabricante);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
